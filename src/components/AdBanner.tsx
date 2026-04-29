import React, { useState, useEffect } from 'react';

interface AdBannerProps {
  className?: string;
}

function AdBanner({ className = '' }: AdBannerProps) {
  // 広告のリストを定義
  const ads = [
    {
      href: "https://px.a8.net/svt/ejp?a8mat=459LBO+DG1FLE+4BB4+5YZ75",
      imgSrc: "https://www27.a8.net/svt/bgt?aid=250710324813&wid=001&eno=01&mid=s00000020128001003000&mc=1",
      trackingSrc: "https://www13.a8.net/0.gif?a8mat=459LBO+DG1FLE+4BB4+5YZ75",
      width: 608,
      height: 78
    },
    {
      href: "https://px.a8.net/svt/ejp?a8mat=459LBO+EAZZ1U+45DI+6AC5D",
      imgSrc: "https://www21.a8.net/svt/bgt?aid=250710324865&wid=001&eno=01&mid=s00000019359001056000&mc=1",
      trackingSrc: "https://www16.a8.net/0.gif?a8mat=459LBO+EAZZ1U+45DI+6AC5D",
      width: 608,
      height: 78
    }
  ];

  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // 30秒おきに広告を切り替え
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, 30000); // 30秒 = 30,000ミリ秒

    return () => clearInterval(interval);
  }, [ads.length]);

  const currentAd = ads[currentAdIndex];

  return (
    <div className={`flex justify-center items-center py-3 ${className}`}>
      <a 
        href={currentAd.href}
        rel="nofollow"
        target="_blank"
        className="block hover:opacity-80 transition-opacity duration-300"
      >
        <img 
          border="0" 
          width={currentAd.width}
          height={currentAd.height}
          alt="" 
          src={currentAd.imgSrc}
          className="max-w-full h-auto rounded-lg shadow-sm"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </a>
      <img 
        border="0" 
        width="1" 
        height="1" 
        src={currentAd.trackingSrc}
        alt=""
        className="hidden"
      />
    </div>
  );
}

export default AdBanner;