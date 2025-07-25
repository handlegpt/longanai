'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const translations = {
  cantonese: {
    title: '收費計劃',
    subtitle: '揀返啱你嘅計劃',
    monthly: '月費',
    yearly: '年費',
    save: '慳',
    period: '/月',
    comingSoon: '即將推出',
    stayTuned: '敬請期待',
    free: {
      name: '免費版',
      price: '0',
      period: '/月',
      description: '啱晒自己玩下、試下嘅用家',
      features: [
        '每個月可以生產10集播客',
        '基本聲線揀選',
        '標準音質',
        '基本客服支援'
      ]
    },
    pro: {
      name: '專業版',
      price: '29',
      period: '/月',
      description: '啱晒內容創作者、頻道主',
      features: [
        '每個月可以生產50集播客',
        '全部聲線任你揀',
        '高清音質',
        '優先客服支援',
        '批量生成功能',
        '自訂播客封面'
      ]
    },
    advanced: {
      name: '高級版',
      price: '99',
      period: '/月',
      description: '啱晒公司團隊一齊用',
      features: [
        '播客生產無限量',
        '全部聲線任你揀',
        '極致音質',
        '專屬客服支援',
        'API介面接入',
        '團隊協作功能',
        '數據分析報告',
        '度身訂造服務'
      ]
    },
    cta: '即刻開始',
    popular: '最受歡迎',
    // FAQ 粤语化
    faq: [
      {
        q: '可唔可以隨時取消訂閱？',
        a: '梗可以，隨時都可以取消，唔會收你額外錢。'
      },
      {
        q: '有咩付款方式？',
        a: '支持支付寶、微信、銀行卡等多種方式。'
      },
      {
        q: '生產嘅播客可唔可以商用？',
        a: '專業版同高級版用戶可以商用播客內容。'
      },
      {
        q: '有冇免費試用？',
        a: '所有收費計劃都有7日免費試用期。'
      }
    ],
    faqTitle: '常見問題',
    copyright: '© 2025 龙眼AI. 保留所有权利.',
    slogan: '让AI讲好你嘅粤语故事，让粤语传承下去'
  },
  mandarin: {
    title: '定价方案',
    subtitle: '选择适合你的方案',
    monthly: '月付',
    yearly: '年付',
    save: '节省',
    period: '/月',
    comingSoon: '即将推出',
    stayTuned: '敬请期待',
    free: {
      name: '免费版',
      price: '0',
      period: '/月',
      description: '适合个人用户试用',
      features: [
        '每月生成10个播客',
        '基础音色选择',
        '标准音质',
        '基础客服支持'
      ]
    },
    pro: {
      name: '专业版',
      price: '29',
      period: '/月',
      description: '适合内容创作者',
      features: [
        '每月生成50个播客',
        '所有音色选择',
        '高清音质',
        '优先客服支持',
        '批量生成功能',
        '自定义播客封面'
      ]
    },
    advanced: {
      name: '高级版',
      price: '99',
      period: '/月',
      description: '适合企业团队使用',
      features: [
        '无限播客生成',
        '所有音色选择',
        '最高音质',
        '专属客服支持',
        'API接口访问',
        '团队协作功能',
        '数据分析报告',
        '定制化服务'
      ]
    },
    cta: '立即开始',
    popular: '最受欢迎',
    faq: [
      {
        q: '可以随时取消订阅吗？',
        a: '是的，你可以随时取消订阅，不会收取额外费用。'
      },
      {
        q: '支持哪些支付方式？',
        a: '支持支付宝、微信支付、银行卡等多种支付方式。'
      },
      {
        q: '生成的播客可以商用吗？',
        a: '专业版和高级版用户拥有播客的商用权利。'
      },
      {
        q: '有免费试用吗？',
        a: '所有付费方案都提供7天免费试用期。'
      }
    ],
    faqTitle: '常见问题',
    copyright: '© 2025 龙眼AI. 保留所有权利.',
    slogan: '让AI讲好你的粤语故事'
  },
  english: {
    title: 'Pricing Plans',
    subtitle: 'Choose the plan that fits your needs',
    monthly: 'Monthly',
    yearly: 'Yearly',
    save: 'Save',
    period: '/month',
    comingSoon: 'Coming Soon',
    stayTuned: 'Stay Tuned',
    free: {
      name: 'Free',
      price: '0',
      period: '/month',
      description: 'Perfect for individual users to try',
      features: [
        '10 podcasts per month',
        'Basic voice options',
        'Standard quality',
        'Basic support'
      ]
    },
    pro: {
      name: 'Pro',
      price: '29',
      period: '/month',
      description: 'Perfect for content creators',
      features: [
        '50 podcasts per month',
        'All voice options',
        'HD quality',
        'Priority support',
        'Batch generation',
        'Custom podcast covers'
      ]
    },
    advanced: {
      name: 'Advanced',
      price: '99',
      period: '/month',
      description: 'Perfect for business teams',
      features: [
        'Unlimited podcasts',
        'All voice options',
        'Highest quality',
        'Dedicated support',
        'API access',
        'Team collaboration',
        'Analytics reports',
        'Custom solutions'
      ]
    },
    cta: 'Get Started',
    popular: 'Most Popular',
    faq: [
      {
        q: 'Can I cancel my subscription anytime?',
        a: 'Yes, you can cancel your subscription at any time without additional charges.'
      },
      {
        q: 'What payment methods do you support?',
        a: 'We support Alipay, WeChat Pay, bank cards and other payment methods.'
      },
      {
        q: 'Can I use the generated podcasts commercially?',
        a: 'Pro and Advanced users have commercial rights to podcast content.'
      },
      {
        q: 'Is there a free trial?',
        a: 'All paid plans offer a 7-day free trial period.'
      }
    ],
    faqTitle: 'Frequently Asked Questions',
    copyright: '© 2025 Longan AI. All rights reserved.',
    slogan: 'Let AI tell your Cantonese stories well'
  }
};

export default function PricingPage() {
  const { language } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  const t = translations[language as keyof typeof translations] || translations.cantonese;
  
  const plans = [
    {
      ...t.free,
      icon: Star,
      popular: false,
      color: 'from-gray-500 to-gray-600'
    },
    {
      ...t.pro,
      icon: Zap,
      popular: true,
      color: 'from-primary-500 to-primary-600'
    },
    {
      ...t.advanced,
      icon: Crown,
      popular: false,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const getPrice = (basePrice: string) => {
    const price = parseInt(basePrice);
    if (billingCycle === 'yearly') {
      return Math.floor(price * 10); // 年付优惠，相当于10个月的价格
    }
    return price;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header section */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            {t.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 mb-8"
          >
            {t.subtitle}
          </motion.p>

          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center space-x-4 mb-12"
          >
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              {t.monthly}
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === 'yearly' ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              {t.yearly}
            </span>
            {billingCycle === 'yearly' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {t.save} 20%
              </span>
            )}
          </motion.div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-xl border-2 ${
                plan.popular ? 'border-primary-500 scale-105' : 'border-gray-100'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-primary-500 text-white">
                    {t.popular}
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className={`w-12 h-12 bg-gradient-to-r ${plan.color} rounded-xl flex items-center justify-center mr-4`}>
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    {plan.price === '0' ? (
                      <>
                        <span className="text-4xl font-bold text-gray-900">¥{getPrice(plan.price)}</span>
                        <span className="text-gray-500 ml-2">{t.period}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-gray-900">
                          {t.comingSoon}
                        </span>
                      </>
                    )}
                  </div>
                  {billingCycle === 'yearly' && plan.price !== '0' && (
                    <p className="text-sm text-gray-500 mt-1">
                      原价 ¥{parseInt(plan.price) * 12}/年
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-primary-500 text-white hover:bg-primary-600 hover:scale-105'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.price === '0' ? t.cta : t.stayTuned}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{t.faqTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {t.faq.map((item, index) => (
              <div key={index} className="text-left">
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>{t.copyright}</p>
            <p className="mt-2">{t.slogan}</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 