import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Calendar, Target, GraduationCap, ArrowRight } from 'lucide-react';
import AnimationWrapper from '../components/AnimationWrapper';
import AdBanner from '../components/AdBanner';

function About() {
  return (
    <div>
      <section className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            {/* Hero Image */}
            <AnimationWrapper className="relative rounded-2xl overflow-hidden shadow-2xl mb-20">
              <img
                src="/images/team.jpg"
                alt="東海大学男子ソフトテニス部"
                className="w-full h-[400px] sm:h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 text-white">
                <h1 className="text-3xl sm:text-5xl font-bold mb-3 sm:mb-4">東海大学男子ソフトテニス部</h1>
                <p className="text-lg sm:text-xl">
                  部員一同、日々の練習に励み、目標達成に向けて全力で取り組んでいます。
                </p>
              </div>
            </AnimationWrapper>

            {/* Club Information */}
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 sm:p-12 mb-20">
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                部活動について
              </h2>
              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-start space-x-4 sm:space-x-6">
                  <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold mb-2">所属</h3>
                    <p className="text-base sm:text-lg text-gray-600">
                      私たちは関東学生リーグ1部に所属しており、1部優勝を目指して日々練習に励んでいます。
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 sm:space-x-6">
                  <Users className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold mb-2">活動目標</h3>
                    <p className="text-base sm:text-lg text-gray-600">
                      関東学生リーグ1部優勝、全日本学生選手権大会でベスト8以上を達成することを目標に掲げています。この目標達成に向けて、技術面だけでなく、精神面の強化にも力を入れて練習に取り組んでいます。
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 sm:space-x-6">
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold mb-2">練習について</h3>
                    <p className="text-base sm:text-lg text-gray-600">
                      週5日の練習体制を取っており、月曜日、水曜日、木曜日、土曜日、日曜日に活動しています。平日は授業終了後から夕方まで、土日は午前中から集中的な練習を行っています。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 入部案内リンク - 落ち着いたデザイン */}
            <div className="relative mb-20">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-12 text-center hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col sm:flex-row items-center justify-center mb-6 sm:mb-8">
                  <div className="bg-blue-100 rounded-full p-4 mb-6 sm:mb-0 sm:mr-6">
                    <GraduationCap className="w-14 h-14 sm:w-16 sm:h-16 text-blue-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-800">入部をお考えの方へ</h2>
                    <p className="text-lg sm:text-xl text-gray-600">
                      入試に関する情報
                    </p>
                  </div>
                </div>
                <p className="text-lg sm:text-2xl mb-8 sm:mb-10 text-gray-700 leading-relaxed max-w-4xl mx-auto">
                  東海大学への入学方法や入部条件について詳しく知りたい方は、
                  <br />
                  <span className="font-bold text-blue-700">入試情報ページ</span>をご確認ください
                </p>
                <Link
                  to="/admission"
                  className="group inline-flex items-center bg-blue-600 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-xl text-lg sm:text-2xl font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 mr-3 sm:mr-4" />
                  <span>入試情報を見る</span>
                  <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 ml-3 sm:ml-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-8">
                  <div className="bg-white rounded-lg px-4 sm:px-6 py-2 sm:py-3 shadow-md border border-gray-200">
                    <span className="text-base sm:text-lg font-semibold text-gray-700">スポーツ推薦なし</span>
                  </div>
                  <div className="bg-white rounded-lg px-4 sm:px-6 py-2 sm:py-3 shadow-md border border-gray-200">
                    <span className="text-base sm:text-lg font-semibold text-gray-700">熱意があれば誰でも入部可能</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement Timeline */}
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 sm:p-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                主な戦績
              </h2>
              <div className="space-y-8 sm:space-y-12">
                {[2025, 2024, 2023, 2005, 2004, 2003, 2002, 2001, 2000, 1999].map((year) => (
                  <div key={year} className="relative">
                    <div className="absolute left-0 top-0 w-1 sm:w-2 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                    <div className="ml-6 sm:ml-8">
                      <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {year}年
                      </h3>
                      <div className="bg-white/50 backdrop-blur rounded-lg p-4 sm:p-6 shadow-lg">
                        <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                          {year === 2025 && (
                            <>
                              <li>春季リーグ：2部1位 → 入替戦勝利し1部昇格</li>
                              <li>東日本インカレ：木村・松本ペア 第2位</li>
                            </>
                          )}
                          {year === 2024 && (
                            <>
                              <li>春季リーグ：2部1位</li>
                              <li>秋季リーグ：2部1位</li>
                              <li>全日本インカレ：ベスト16</li>
                              <li>東日本インカレ：松本(航)・松本(隼)ペア ベスト8</li>
                            </>
                          )}
                          {year === 2023 && (
                            <>
                              <li>全日本インカレ：ベスト8</li>
                              <li>春季リーグ：2部1位</li>
                              <li>秋季リーグ：2部5位</li>
                            </>
                          )}
                          {year === 2005 && (
                            <>
                              <li>春季リーグ：2部3位</li>
                              <li>秋季リーグ：4部5位 → 入替戦勝利し3部昇格</li>
                              <li>全日本学生選手権：鳥谷部・高田組 出場</li>
                            </>
                          )}
                          {year === 2004 && (
                            <>
                              <li>春季リーグ：2部4位</li>
                              <li>秋季リーグ：4部6位 → 4部残留</li>
                              <li>全日本学生選手権：千葉・本村組 出場</li>
                              <li>神奈川県大会：鳥谷部裕紀・萩原大樹 優勝</li>
                            </>
                          )}
                          {year === 2003 && (
                            <>
                              <li>秋季リーグ：4部1位</li>
                              <li>関東学生全国大会：北海道選抜 出場</li>
                              <li>神奈川県大会：川島啓之 優勝</li>
                            </>
                          )}
                          {year === 2002 && (
                            <>
                              <li>秋季リーグ：5部5位</li>
                              <li>全国大会：千葉・東組 出場</li>
                              <li>神奈川県大会：澁井央紀 優勝</li>
                            </>
                          )}
                          {year === 2001 && (
                            <>
                              <li>春季リーグ：6部2位</li>
                              <li>春季入替戦：昇格（6部→5部）</li>
                              <li>秋季リーグ：5部6位</li>
                              <li>全日本学生選手権：山形・山口組 出場</li>
                            </>
                          )}
                          {year === 2000 && (
                            <>
                              <li>春季リーグ：3部2位</li>
                              <li>春季入替戦：昇格（3部→2部）</li>
                              <li>秋季リーグ：6部5位</li>
                              <li>全日本学生選手権：千葉・白組 出場</li>
                              <li>神奈川県大会：長澤裕基 優勝</li>
                            </>
                          )}
                          {year === 1999 && (
                            <>
                              <li>秋季リーグ：6部5位</li>
                              <li>神奈川県大会：岡永知也 優勝</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 広告配置 - 部活動紹介ページ下部 */}
            <AdBanner className="mt-12 sm:mt-20" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;