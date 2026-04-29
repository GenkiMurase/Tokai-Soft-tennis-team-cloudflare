import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing environment variables" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: files, error: listError } = await supabase.storage
      .from("images")
      .list("", { limit: 1000 });

    if (listError) {
      throw listError;
    }

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ message: "No images found", processedCount: 0 }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: compressedMetadata } = await supabase
      .from("image_compression_metadata")
      .select("image_path");

    const compressedPaths = new Set(
      (compressedMetadata || []).map((m: any) => m.image_path)
    );

    const processedFiles = [];
    let processedCount = 0;

    for (const file of files) {
      if (!file.name.includes(".")) continue;

      if (compressedPaths.has(file.name)) {
        console.log(`Skipping already compressed file: ${file.name}`);
        continue;
      }

      const { data: fileData, error: downloadError } = await supabase.storage
        .from("images")
        .download(file.name);

      if (downloadError) {
        console.error(`Failed to download ${file.name}:`, downloadError);
        continue;
      }

      const buffer = await fileData.arrayBuffer();
      const originalSize = buffer.byteLength;
      const compressedBuffer = await compressImageData(buffer);

      if (compressedBuffer.byteLength < buffer.byteLength) {
        const { error: uploadError } = await supabase.storage
          .from("images")
          .update(file.name, new Blob([compressedBuffer]), {
            upsert: true,
          });

        if (!uploadError) {
          const reduction = Math.round(
            ((buffer.byteLength - compressedBuffer.byteLength) /
              buffer.byteLength) *
              100
          );

          await supabase.from("image_compression_metadata").insert({
            image_path: file.name,
            original_size: originalSize,
            compressed_size: compressedBuffer.byteLength,
            compression_ratio: reduction,
          });

          processedCount++;
          processedFiles.push({
            name: file.name,
            originalSize: originalSize,
            compressedSize: compressedBuffer.byteLength,
            reduction: reduction,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: "Compression completed",
        processedCount,
        totalFiles: files.length,
        details: processedFiles,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function compressImageData(buffer: ArrayBuffer): Promise<ArrayBuffer> {
  try {
    const blob = new Blob([buffer], { type: "image/jpeg" });
    const canvas = new OffscreenCanvas(1200, 1200);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return buffer;
    }

    const imageBitmap = await createImageBitmap(blob);
    let width = imageBitmap.width;
    let height = imageBitmap.height;

    if (width > 1200 || height > 1200) {
      const ratio = Math.min(1200 / width, 1200 / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imageBitmap, 0, 0, width, height);

    const compressedBlob = await canvas.convertToBlob({
      type: "image/jpeg",
      quality: 0.85,
    });

    return await compressedBlob.arrayBuffer();
  } catch (error) {
    console.warn("Compression failed, returning original:", error);
    return buffer;
  }
}
