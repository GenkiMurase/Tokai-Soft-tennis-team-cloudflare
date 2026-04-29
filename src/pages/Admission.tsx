import React from 'react';
import { ExternalLink, Users, MapPin, GraduationCap, AlertCircle, BookOpen } from 'lucide-react';
import AnimationWrapper from '../components/AnimationWrapper';
import AdBanner from '../components/AdBanner';

function Admission() {
  const admissionTypes = [
    {
      title: '総合型選抜',
      methods: ['学科課題型', '適性面接型', 'スポーツ・音楽自己推薦型'],
      description: '書類審査、課題発表、面接試験で総合的に評価',
      details: [
        '学科課題型：学科ごとに指定された課題に取り組み、学ぶ意欲や姿勢、入学後の対応力を評価',
        '適性面接型：書類審査と適性面接試験のみで評価',
        'スポーツ・音楽自己推薦型：スポーツや音楽で優れた成績を持つ方が対象'
      ]
    },
    {
      title: '学校推薦型',
      methods: ['公募制学校推薦型選抜', '指定学校推薦型選抜'],
      description: '出身高等学校の推薦による選抜',
      details: [
        '公募制学校推薦型選抜：出身高等学校の学校長推薦が必要、書類審査と面接等で評価',
        '指定学校推薦型選抜：東海大学が指定する高等学校からの推薦による選抜'
      ]
    },
    {
      title: '学力選抜',
      methods: ['文系・理系学部統一選抜（前期・後期）', '一般選抜', '大学入学共通テスト利用選抜（前期・後期）'],
      description: '学力試験による選抜',
      details: [
        '文系・理系学部統一選抜（前期・後期）：複数学部・学科を同時に受験可能な統一選抜',
        '一般選抜：3教科型の学科試験、英語外部試験スコア利用可',
        '大学入学共通テスト利用選抜（前期・後期）：大学入学共通テストの成績で合否判定、大学独自の個別試験なし'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimationWrapper className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                東海大学ソフトテニス部 入試情報
              </h1>
              <p className="text-lg sm:text-xl text-gray-600">
                ソフトテニス部への入部を希望される方へ
              </p>
            </div>

            {/* 入部条件・活動場所 */}
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-16 sm:mb-20">
              <AnimationWrapper className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center mb-6">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 mr-3 sm:mr-4" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">入部条件</h2>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                    東海大学ソフトテニス部は、<strong className="text-blue-700">実力や大会成績による入部制限はありません</strong>。
                    ソフトテニスに対する熱意があれば、どなたでも入部可能です。
                  </p>
                  <div className="bg-white/80 rounded-xl p-4 sm:p-6 shadow-md">
                    <div className="flex items-center text-orange-600 mb-3">
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                      <span className="text-base sm:text-lg font-semibold">重要</span>
                    </div>
                    <p className="text-gray-700 text-base sm:text-lg">スポーツ推薦制度はありません</p>
                  </div>
                </div>
              </AnimationWrapper>

              <AnimationWrapper className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center mb-6">
                  <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 mr-3 sm:mr-4" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">主な活動場所</h2>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                    主な活動場所は<strong className="text-green-700">東海大学湘南キャンパス</strong>のテニスコートです。
                  </p>
                  <div className="bg-white/80 rounded-xl p-4 sm:p-6 shadow-md">
                    <p className="text-gray-700 text-sm sm:text-base">
                      湘南キャンパス以外（特に代々木キャンパス）の学生は参加が難しい場合がありますが、
                      1・2年生が湘南キャンパス、3・4年生が品川キャンパスの学生でも両立して活動している例があります。
                    </p>
                  </div>
                </div>
              </AnimationWrapper>
            </div>

            {/* 入試方式一覧 */}
            <div className="mb-16 sm:mb-20">
              <AnimationWrapper className="text-center mb-12">
                <div className="flex items-center justify-center mb-6">
                  <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 mr-3 sm:mr-4" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">東海大学の主な入試方式</h2>
                </div>
                <p className="text-base sm:text-lg text-gray-600">
                  以下の入試方式で東海大学に合格し、入学後に部活動へ参加してください
                </p>
              </AnimationWrapper>
              
              <div className="space-y-6 sm:space-y-8">
                {admissionTypes.map((type, index) => (
                  <AnimationWrapper 
                    key={index} 
                    className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                      <div className="md:col-span-1">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">{type.title}</h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-4">{type.description}</p>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700 mb-3">主な入試方法:</p>
                          {type.methods.map((method, methodIndex) => (
                            <div key={methodIndex} className="flex items-start">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-sm sm:text-base text-gray-700">{method}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">詳細</h4>
                        <div className="space-y-3">
                          {type.details.map((detail, detailIndex) => (
                            <div key={detailIndex} className="flex items-start">
                              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></span>
                              <span className="text-sm sm:text-base text-gray-700">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AnimationWrapper>
                ))}
              </div>
            </div>

            {/* 注意事項 */}
            <AnimationWrapper className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 sm:p-8 shadow-xl mb-12">
              <div className="flex items-center mb-8">
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600 mr-3 sm:mr-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">注意事項</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white/80 rounded-xl p-4 sm:p-6 shadow-md">
                  <p className="text-base sm:text-lg text-gray-700 font-semibold mb-3">
                    ソフトテニス部はスポーツ推薦の対象外です
                  </p>
                  <p className="text-sm sm:text-base text-gray-600">
                    入部希望者は、上記いずれかの入試方式で東海大学に合格し、入学後に部活動へ参加してください。
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-4 sm:p-6 shadow-md">
                  <p className="text-base sm:text-lg text-gray-700 font-semibold mb-3">
                    入試情報は年度ごとに変更される場合があります
                  </p>
                  <p className="text-sm sm:text-base text-gray-600">
                    必ず東海大学公式サイトや入学試験要項をご確認ください。
                  </p>
                </div>
              </div>
            </AnimationWrapper>

            {/* 公式サイトへのリンク */}
            <AnimationWrapper className="text-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-white shadow-2xl">
                <div className="flex items-center justify-center mb-6">
                  <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mr-3 sm:mr-4" />
                  <h2 className="text-2xl sm:text-3xl font-bold">詳細な入試情報</h2>
                </div>
                <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-blue-100 leading-relaxed">
                  最新の入試情報、詳細な選考方法、出願要項については
                  <br />
                  東海大学公式サイトをご確認ください
                </p>
                <a
                  href="https://www.u-tokai.ac.jp/examination-admissions/exam/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-white text-blue-600 px-8 sm:px-10 py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-blue-50 transition-colors duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  <span>東海大学 入試情報ページ</span>
                  <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 ml-3" />
                </a>
              </div>
            </AnimationWrapper>
            
            {/* 広告配置 - 入試情報ページ下部 */}
            <AdBanner className="mt-12 sm:mt-20" />
          </AnimationWrapper>
        </div>
      </section>
    </div>
  );
}

export default Admission;