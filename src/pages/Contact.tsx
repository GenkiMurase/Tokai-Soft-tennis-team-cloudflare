import React from 'react';
import { Instagram, X } from 'lucide-react';
import AdBanner from '../components/AdBanner';

function Contact() {
  return (
    <div className="pt-24">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 sm:mb-16 animate-fadeIn">お問い合わせ</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
              {/* 男子ソフトテニス部 */}
              <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
                <h3 className="text-lg sm:text-xl font-bold mb-6">男子ソフトテニス部</h3>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex justify-center space-x-6 sm:space-x-8">
                    <a 
                      href="https://x.com/tokaisofttennis" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center space-y-2 text-gray-700 hover:text-blue-500 transition duration-300 p-4 rounded-lg hover:bg-blue-50"
                    >
                      <X className="w-10 h-10" />
                      <span className="text-sm font-medium">@tokaisofttennis</span>
                    </a>
                    <a 
                      href="https://www.instagram.com/tokai_soft_tennis_/?igsh=MWRiZWI0ZTgzaG52cA%3D%3D" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center space-y-2 text-gray-700 hover:text-pink-500 transition duration-300 p-4 rounded-lg hover:bg-pink-50"
                    >
                      <Instagram className="w-10 h-10" />
                      <span className="text-sm font-medium">@tokai_soft_tennis_</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* 女子ソフトテニス部 */}
              <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
                <h3 className="text-lg sm:text-xl font-bold mb-6">女子ソフトテニス部</h3>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex justify-center space-x-6 sm:space-x-8">
                    <a 
                      href="https://x.com/tokaisofteni" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex flex-col items-center space-y-2 text-gray-700 hover:text-blue-500 transition duration-300 p-4 rounded-lg hover:bg-blue-50"
                    >
                      <X className="w-10 h-10" />
                      <span className="text-sm font-medium">@tokaisofteni</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-base sm:text-lg text-gray-600 bg-blue-50 p-4 sm:p-6 rounded-lg">
                お問い合わせは各部のXまたはInstagramのDMまでお願いいたします。
              </p>
            </div>
            
            {/* 広告配置 - お問い合わせページ下部 */}
            <AdBanner className="mt-12" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;