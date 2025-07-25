'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Users, Database, Server } from 'lucide-react';
import { useState } from 'react';

const translations = {
  cantonese: {
    title: '私隱與安全',
    subtitle: '我哋重視你嘅私隱同數據安全',
    sections: {
      dataCollection: {
        title: '數據收集',
        icon: Database,
        content: [
          '我哋只收集必要嘅個人信息，包括你嘅電子郵箱地址',
          '播客生成內容會暫時存儲，用於提供服務',
          '唔會收集你嘅敏感個人信息，如身份證號碼、銀行卡信息等',
          '你可以隨時要求刪除你嘅個人數據'
        ]
      },
      dataSecurity: {
        title: '數據安全',
        icon: Shield,
        content: [
          '所有數據都經過加密傳輸同存儲',
          '使用行業標準嘅安全協議保護你嘅信息',
          '定期進行安全審計同漏洞掃描',
          '嚴格嘅訪問控制，確保只有授權人員可以訪問數據'
        ]
      },
      dataUsage: {
        title: '數據使用',
        icon: Eye,
        content: [
          '你嘅個人信息只會用於提供服務同改善用戶體驗',
          '唔會向第三方出售或分享你嘅個人信息',
          '生成嘅播客內容，你可以選擇公開或私密',
          '你可以隨時控制你嘅數據使用權限'
        ]
      },
      userRights: {
        title: '用戶權利',
        icon: Users,
        content: [
          '你有權訪問、修改同刪除你嘅個人信息',
          '可以隨時取消訂閱同刪除賬戶',
          '有權要求數據可攜性，即下載你嘅數據',
          '可以投訴任何違反私隱政策嘅行為'
        ]
      },
      cookies: {
        title: 'Cookie 使用',
        icon: FileText,
        content: [
          '使用必要嘅 Cookie 來提供服務功能',
          '分析 Cookie 用於改善網站性能',
          '你可以喺瀏覽器設置中管理 Cookie',
          '唔會使用追蹤 Cookie 來收集額外信息'
        ]
      },
      thirdParty: {
        title: '第三方服務',
        icon: Server,
        content: [
          '使用可信嘅第三方服務提供商',
          '所有第三方都符合嚴格嘅數據保護標準',
          '唔會向第三方分享你嘅個人信息',
          '定期審查第三方嘅安全合規性'
        ]
      }
    },
    contact: {
      title: '聯繫我哋',
      email: 'privacy@longan.ai',
      description: '如果你對我哋嘅私隱政策有任何問題，請隨時聯繫我哋。'
    },
    lastUpdated: '最後更新：2024年12月'
  },
  mandarin: {
    title: '隐私与安全',
    subtitle: '我们重视您的隐私和数据安全',
    sections: {
      dataCollection: {
        title: '数据收集',
        icon: Database,
        content: [
          '我们只收集必要的个人信息，包括您的电子邮箱地址',
          '播客生成内容会暂时存储，用于提供服务',
          '不会收集您的敏感个人信息，如身份证号码、银行卡信息等',
          '您可以随时要求删除您的个人数据'
        ]
      },
      dataSecurity: {
        title: '数据安全',
        icon: Shield,
        content: [
          '所有数据都经过加密传输和存储',
          '使用行业标准的安全协议保护您的信息',
          '定期进行安全审计和漏洞扫描',
          '严格的访问控制，确保只有授权人员可以访问数据'
        ]
      },
      dataUsage: {
        title: '数据使用',
        icon: Eye,
        content: [
          '您的个人信息只会用于提供服务和改进用户体验',
          '不会向第三方出售或分享您的个人信息',
          '生成的播客内容，您可以选择公开或私密',
          '您可以随时控制您的数据使用权限'
        ]
      },
      userRights: {
        title: '用户权利',
        icon: Users,
        content: [
          '您有权访问、修改和删除您的个人信息',
          '可以随时取消订阅和删除账户',
          '有权要求数据可携性，即下载您的数据',
          '可以投诉任何违反隐私政策的行为'
        ]
      },
      cookies: {
        title: 'Cookie 使用',
        icon: FileText,
        content: [
          '使用必要的 Cookie 来提供服务功能',
          '分析 Cookie 用于改善网站性能',
          '您可以在浏览器设置中管理 Cookie',
          '不会使用追踪 Cookie 来收集额外信息'
        ]
      },
      thirdParty: {
        title: '第三方服务',
        icon: Server,
        content: [
          '使用可信的第三方服务提供商',
          '所有第三方都符合严格的数据保护标准',
          '不会向第三方分享您的个人信息',
          '定期审查第三方的安全合规性'
        ]
      }
    },
    contact: {
      title: '联系我们',
      email: 'privacy@longan.ai',
      description: '如果您对我们的隐私政策有任何问题，请随时联系我们。'
    },
    lastUpdated: '最后更新：2024年12月'
  },
  english: {
    title: 'Privacy & Security',
    subtitle: 'We value your privacy and data security',
    sections: {
      dataCollection: {
        title: 'Data Collection',
        icon: Database,
        content: [
          'We only collect necessary personal information, including your email address',
          'Podcast generation content is temporarily stored for service provision',
          'We do not collect sensitive personal information such as ID numbers or bank card details',
          'You can request deletion of your personal data at any time'
        ]
      },
      dataSecurity: {
        title: 'Data Security',
        icon: Shield,
        content: [
          'All data is encrypted during transmission and storage',
          'We use industry-standard security protocols to protect your information',
          'Regular security audits and vulnerability scans are conducted',
          'Strict access controls ensure only authorized personnel can access data'
        ]
      },
      dataUsage: {
        title: 'Data Usage',
        icon: Eye,
        content: [
          'Your personal information is only used to provide services and improve user experience',
          'We do not sell or share your personal information with third parties',
          'Generated podcast content can be set as public or private',
          'You can control your data usage permissions at any time'
        ]
      },
      userRights: {
        title: 'User Rights',
        icon: Users,
        content: [
          'You have the right to access, modify, and delete your personal information',
          'You can cancel subscriptions and delete your account at any time',
          'You have the right to data portability, i.e., download your data',
          'You can report any violations of privacy policy'
        ]
      },
      cookies: {
        title: 'Cookie Usage',
        icon: FileText,
        content: [
          'We use necessary cookies to provide service functionality',
          'Analytics cookies are used to improve website performance',
          'You can manage cookies in your browser settings',
          'We do not use tracking cookies to collect additional information'
        ]
      },
      thirdParty: {
        title: 'Third-Party Services',
        icon: Server,
        content: [
          'We use trusted third-party service providers',
          'All third parties comply with strict data protection standards',
          'We do not share your personal information with third parties',
          'We regularly review third-party security compliance'
        ]
      }
    },
    contact: {
      title: 'Contact Us',
      email: 'privacy@longan.ai',
      description: 'If you have any questions about our privacy policy, please feel free to contact us.'
    },
    lastUpdated: 'Last Updated: December 2024'
  }
};

export default function PrivacyPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('cantonese');
  const t = translations[selectedLanguage as keyof typeof translations] || translations.cantonese;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.title}</h1>
          <p className="text-xl text-gray-600">{t.subtitle}</p>
        </motion.div>

        {/* Language selector */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-sm">
            {Object.keys(translations).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedLanguage === lang
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {lang === 'cantonese' ? '粤语' : lang === 'mandarin' ? '中文' : 'English'}
              </button>
            ))}
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-8">
          {Object.entries(t.sections).map(([key, section], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-4">
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Contact section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-8 text-white text-center mt-12"
        >
          <h3 className="text-2xl font-bold mb-4">{t.contact.title}</h3>
          <p className="text-lg mb-4">{t.contact.description}</p>
          <a
            href={`mailto:${t.contact.email}`}
            className="inline-flex items-center space-x-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <span>{t.contact.email}</span>
          </a>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-8 text-gray-500"
        >
          <p>{t.lastUpdated}</p>
        </motion.div>
      </main>
    </div>
  );
} 