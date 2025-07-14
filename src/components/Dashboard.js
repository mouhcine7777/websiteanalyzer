import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Instagram, Linkedin, Facebook, Youtube, Music, Sparkles, ArrowRight, TrendingUp, Users, Eye, Zap, BarChart3, Activity, Brain, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  const analyticsCards = [
    {
      id: 'website',
      title: 'Website Analyzer',
      description: 'Complete SEO, performance & accessibility analysis',
      icon: Globe,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      stats: { label: 'Sites Analyzed', value: '10.2K' },
      features: ['SEO Optimization', 'Performance Metrics', 'Accessibility Check', 'Mobile Readiness'],
      route: '/websiteanalyzer'
    },
    {
      id: 'instagram',
      title: 'Instagram Analytics',
      description: 'Engagement insights & growth optimization',
      icon: Instagram,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'from-pink-50 to-rose-50',
      borderColor: 'border-pink-200',
      stats: { label: 'Profiles Tracked', value: '8.7K' },
      features: ['Engagement Analysis', 'Content Strategy', 'Hashtag Research', 'Competitor Insights'],
      route: '/instagramanalyzer'
    },
    {
      id: 'linkedin',
      title: 'LinkedIn Insights',
      description: 'Professional network & content analysis',
      icon: Linkedin,
      color: 'from-blue-600 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      stats: { label: 'Professionals', value: '5.3K' },
      features: ['Profile Optimization', 'Network Growth', 'Content Performance', 'Industry Trends'],
      route: '/linkedin-analytics'
    },
    {
      id: 'facebook',
      title: 'Facebook Analytics',
      description: 'Page performance & audience insights',
      icon: Facebook,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      stats: { label: 'Pages Analyzed', value: '12.1K' },
      features: ['Audience Insights', 'Post Performance', 'Ad Analytics', 'Community Growth'],
      route: '/facebook-analytics'
    },
    {
      id: 'youtube',
      title: 'YouTube Analytics',
      description: 'Channel growth & video optimization',
      icon: Youtube,
      color: 'from-red-500 to-red-600',
      bgColor: 'from-red-50 to-red-100',
      borderColor: 'border-red-200',
      stats: { label: 'Channels', value: '6.8K' },
      features: ['Video Performance', 'Subscriber Growth', 'Revenue Insights', 'Content Strategy'],
      route: '/youtubeanalyzer'
    },
    {
      id: 'tiktok',
      title: 'TikTok Analytics',
      description: 'Viral content & trend analysis',
      icon: Music,
      color: 'from-gray-800 to-gray-900',
      bgColor: 'from-gray-50 to-gray-100',
      borderColor: 'border-gray-200',
      stats: { label: 'Creators', value: '4.2K' },
      features: ['Viral Potential', 'Trend Analysis', 'Hashtag Strategy', 'Growth Hacking'],
      route: '/tiktok-analytics'
    }
  ];

  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
                AI Analytics Suite
              </h1>
              <p className="text-gray-600 mt-1">Intelligent insights across all your platforms</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">All Systems Active</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">47.2K</p>
                <p className="text-sm text-gray-600">Total Analyses</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">1.2K</p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">+23%</p>
                <p className="text-sm text-gray-600">Growth Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyticsCards.map((card) => {
            const Icon = card.icon;
            const isHovered = hoveredCard === card.id;
            
            return (
              <div
                key={card.id}
                className={`relative group cursor-pointer transition-all duration-500 transform ${
                  isHovered ? 'scale-105 -translate-y-2' : 'hover:scale-102'
                }`}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleCardClick(card.route)}
              >
                {/* Card Background with Glassmorphism */}
                <div className={`
                  relative overflow-hidden rounded-3xl border-2 ${card.borderColor} 
                  bg-gradient-to-br ${card.bgColor} backdrop-blur-sm
                  shadow-lg hover:shadow-2xl transition-all duration-500
                  ${isHovered ? 'border-opacity-50' : 'border-opacity-20'}
                `}>
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${card.color} transform translate-x-8 -translate-y-8`}></div>
                    <div className={`absolute bottom-0 left-0 w-24 h-24 rounded-full bg-gradient-to-tr ${card.color} transform -translate-x-4 translate-y-4`}></div>
                  </div>

                  {/* Card Content */}
                  <div className="relative p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl bg-gradient-to-r ${card.color} shadow-lg transform transition-transform duration-300 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{card.stats.value}</p>
                        <p className="text-xs text-gray-600">{card.stats.label}</p>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-gray-900 group-hover:to-gray-600 transition-all duration-300">
                        {card.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {card.description}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                      <div className="grid grid-cols-2 gap-2">
                        {card.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${card.color}`}></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className={`
                      flex items-center justify-between p-3 rounded-xl border-2 
                      transition-all duration-300 group-hover:border-opacity-50
                      ${isHovered ? `bg-gradient-to-r ${card.color} border-transparent` : 'bg-white/50 border-gray-200'}
                    `}>
                      <span className={`font-medium text-sm transition-colors duration-300 ${
                        isHovered ? 'text-white' : 'text-gray-700'
                      }`}>
                        Start Analysis
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-all duration-300 ${
                        isHovered ? 'text-white translate-x-1' : 'text-gray-500'
                      }`} />
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  {isHovered && (
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${card.color} opacity-10 animate-pulse`}></div>
                  )}
                </div>

                {/* Floating Action Indicator */}
                {isHovered && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className={`p-2 rounded-full bg-gradient-to-r ${card.color} shadow-lg animate-bounce`}>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="text-gray-600">Powered by Advanced AI Analytics</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;