import React from 'react';
import { Shield, Lock, Eye, Database, UserCheck, AlertCircle } from 'lucide-react';
import AnimationWrapper from '../components/AnimationWrapper';

function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimationWrapper className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <Shield className="w-12 h-12 text-green-600 mr-4" />
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">プライバシーポリシー</h1>
              </div>
              <p className="text-lg text-gray-600">
                個人情報の取り扱いに関する方針
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
              <div className="border-b pb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Database className="w-6 h-6 text-green-600 mr-3" />
                  <span className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                  取得する個人情報
                </h2>
                <p className="text-gray-700">
                  甲は、乙によるフォーム送信等の際に、氏名・メールアドレス等の個人情報を取得する場合がある。
                </p>
              </div>

              <div className="border-b pb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <UserCheck className="w-6 h-6 text-green-600 mr-3" />
                  <span className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                  利用目的
                </h2>
                <div className="text-gray-700">
                  <p className="mb-3">甲は、取得した個人情報を以下の目的に利用する。</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>お問い合わせへの対応</li>
                    <li>活動案内・通知</li>
                    <li>サイト改善のための統計分析</li>
                  </ul>
                </div>
              </div>

              <div className="border-b pb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Lock className="w-6 h-6 text-green-600 mr-3" />
                  <span className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                  第三者提供
                </h2>
                <p className="text-gray-700">
                  法令等による場合を除き、乙の同意なしに第三者提供は行わない。
                </p>
              </div>

              <div className="border-b pb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Eye className="w-6 h-6 text-green-600 mr-3" />
                  <span className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
                  アクセス解析およびクッキー
                </h2>
                <div className="text-gray-700">
                  <p className="mb-3">
                    甲は、Google Analytics等を利用してサイト利用状況を把握するが、個人を特定する目的では使用しない。
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">使用している解析ツール</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Google Analytics（アクセス解析）</li>
                      <li>• Google Tag Manager（タグ管理）</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-b pb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <UserCheck className="w-6 h-6 text-green-600 mr-3" />
                  <span className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">5</span>
                  個人情報の開示・訂正・削除
                </h2>
                <p className="text-gray-700">
                  乙は、自己の個人情報の開示・訂正・削除を甲に請求することができる。
                </p>
              </div>

              <div className="border-b pb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Shield className="w-6 h-6 text-green-600 mr-3" />
                  <span className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">6</span>
                  安全管理
                </h2>
                <div className="text-gray-700">
                  <p className="mb-3">甲は、個人情報の漏洩・改ざんを防止するための適切な措置を講じる。</p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">セキュリティ対策</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• SSL/TLS暗号化通信の使用</li>
                      <li>• アクセス制限による不正アクセス防止</li>
                      <li>• 定期的なセキュリティ監査の実施</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <AlertCircle className="w-6 h-6 text-green-600 mr-3" />
                  <span className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">7</span>
                  改定
                </h2>
                <p className="text-gray-700">
                  本ポリシーは必要に応じて改定される。改定後は本サイト上での掲示をもって効力を発する。
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">プライバシー保護に関する重要なお知らせ</h3>
                  <p className="text-yellow-700 text-sm">
                    当サイトでは、部員・関係者のプライバシー保護を最優先に考えています。
                    無許可での個人情報の掲載や、誹謗中傷・個人特定につながる行為は固く禁止されており、
                    発見次第、適切な法的措置を講じます。
                  </p>
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

export default Privacy;