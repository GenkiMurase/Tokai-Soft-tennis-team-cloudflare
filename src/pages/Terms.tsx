import React from 'react';
import { Shield, FileText, AlertTriangle } from 'lucide-react';
import AnimationWrapper from '../components/AnimationWrapper';

function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimationWrapper className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <FileText className="w-12 h-12 text-blue-600 mr-4" />
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">利用規約</h1>
              </div>
              <p className="text-lg text-gray-600">
                東海大学ソフトテニス部ウェブサイトの利用に関する規約
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
              <div className="border-b pb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                  定義
                </h2>
                <div className="space-y-3 text-gray-700">
                  <p><strong>1.</strong> 本規約において、甲とは東海大学ソフトテニス部が運営するウェブサイト「https://tokai-softtennis.com/」（以下「本サイト」という）の管理主体をいう。</p>
                  <p><strong>2.</strong> 乙とは、本サイトを閲覧または利用するすべての個人・団体をいう。</p>
                </div>
              </div>

              <div className="border-b pb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                  利用目的
                </h2>
                <p className="text-gray-700">
                  甲は、乙に対し、本サイトを通じてソフトテニス部の活動報告・試合情報その他関連コンテンツを閲覧できる環境を提供する。
                </p>
              </div>

              <div className="border-b pb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                  知的財産権
                </h2>
                <p className="text-gray-700">
                  コンテンツの著作権は甲または正当な権利者に帰属し、乙は無断使用をしてはならない。
                </p>
              </div>

              <div className="border-b pb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
                  禁止事項
                </h2>
                <div className="text-gray-700">
                  <p className="mb-3">乙は、以下の行為を行ってはならない：</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>サイト運営の妨害</li>
                    <li>他者の権利侵害</li>
                    <li>不正アクセス・データ改ざん</li>
                    <li>法令・公序良俗違反</li>
                    <li>その他甲が不適切と判断する行為</li>
                  </ul>
                </div>
              </div>

              <div className="border-b pb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">5</span>
                  免責事項
                </h2>
                <p className="text-gray-700">
                  甲は、本サイト上の情報の正確性・安全性について一切保証せず、利用によって生じたいかなる損害についても責任を負わない。
                </p>
              </div>

              <div className="border-b pb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">6</span>
                  サービスの変更・中断・終了
                </h2>
                <p className="text-gray-700">
                  甲は、乙への事前通知なく、本サイトの内容や提供を変更・中断・終了できるものとする。
                </p>
              </div>

              <div className="border-b pb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">7</span>
                  規約の改定
                </h2>
                <p className="text-gray-700">
                  甲は、必要に応じて本規約を改定できる。改定後は本サイト上の掲示をもって効力を発する。
                </p>
              </div>

              <div className="border-b pb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">8</span>
                  準拠法および裁判管轄
                </h2>
                <p className="text-gray-700">
                  本規約の準拠法は日本法とし、東京地方裁判所を第一審の専属的合意管轄裁判所とする。
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-3" />
                  <span className="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">9</span>
                  誹謗中傷・名誉毀損等への対応（追加条項）
                </h2>
                <div className="space-y-4 text-red-800">
                  <div>
                    <p className="font-semibold mb-2">1. 禁止行為</p>
                    <p className="mb-2">乙は、本サイト内外を問わず、甲の部員・指導者・関係者に対して、次のいずれかに該当する行為を行ってはならない。</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>名誉を毀損する発言・投稿（SNS・YouTubeコメント・掲示板等）</li>
                      <li>プライバシーの侵害（無許可の顔出し・個人情報掲載等）</li>
                      <li>悪意ある編集や切り取りによる動画の公開</li>
                      <li>過度な批判・侮辱・差別的表現</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-semibold mb-2">2. 対応措置</p>
                    <p className="mb-2">甲は、前項に違反する行為を確認した場合、以下の措置を取ることがある。</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>該当動画・投稿の削除要請（YouTube、X等プラットフォーム運営者へ通報）</li>
                      <li>法的措置（名誉毀損・業務妨害・プライバシー侵害等による損害賠償請求・刑事告訴）</li>
                      <li>関係機関・大学への通報（所属団体や関係者が判明した場合）</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-semibold mb-2">3. 適用範囲</p>
                    <p>乙が運営するSNSやメディアに対しても、上記の行為を含む場合は対象となる。</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-500 text-sm">
                最終更新日：{new Date().toLocaleDateString('ja-JP')}
              </p>
            </div>
          </AnimationWrapper>
        </div>
      </section>
    </div>
  );
}

export default Terms;
