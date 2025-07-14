import React, { useState } from 'react';
import { Globe, Search, Loader2, CheckCircle, XCircle, BarChart3, Users, DollarSign, Calendar, MapPin, Phone, Mail, Building2, Star, TrendingUp, Shield, Zap, Target, Award, AlertTriangle, PieChart, Rocket, Eye, Brain, TrendingDown } from 'lucide-react';

const WebsiteAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const OPENROUTER_API_KEY = '';

  const fetchWebsiteContent = async (websiteUrl) => {
    try {
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(websiteUrl)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch website content');
      }
      const html = await response.text();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const scripts = doc.querySelectorAll('script, style');
      scripts.forEach(el => el.remove());
      
      const textContent = doc.body?.textContent || doc.textContent || '';
      return textContent.substring(0, 8000);
    } catch (error) {
      console.error('Error fetching website content:', error);
      throw error;
    }
  };

  const analyzeWithAI = async (content, websiteUrl) => {
    const prompt = `Analyze the following website content and provide a comprehensive business analysis. The website URL is: ${websiteUrl}

Website Content:
${content}

Please provide a detailed JSON response with the following structure:
{
  "companyName": "Company name",
  "description": "Brief company description",
  "industry": "Industry sector",
  "foundedYear": "Year founded or estimated",
  "headquarters": "Location of headquarters",
  "companySize": "Estimated company size",
  "revenue": "Estimated revenue range",
  "businessModel": "Business model description",
  "products": ["List of main products/services"],
  "targetMarket": "Target market description",
  "competitiveAdvantages": ["List of competitive advantages"],
  "technologies": ["Technologies used"],
  "socialMedia": {
    "platforms": ["List of social media platforms"],
    "presence": "Social media presence assessment"
  },
  "contactInfo": {
    "email": "Contact email if found",
    "phone": "Phone number if found",
    "address": "Physical address if found"
  },
  "websiteQuality": {
    "design": "Design quality assessment (1-10)",
    "userExperience": "UX assessment (1-10)",
    "contentQuality": "Content quality (1-10)",
    "technicalSEO": "Technical SEO assessment (1-10)",
    "mobileOptimization": "Mobile optimization score (1-10)",
    "loadingSpeed": "Loading speed assessment (1-10)"
  },
  "marketPosition": "Market position assessment",
  "growthPotential": "Growth potential assessment",
  "trustScore": "Trust score (1-10)",
  "financialHealth": {
    "profitability": "Profitability assessment",
    "fundingStatus": "Funding status and investors",
    "valuation": "Estimated company valuation",
    "financialStability": "Financial stability score (1-10)"
  },
  "operationalMetrics": {
    "teamSize": "Estimated team size",
    "globalPresence": "Global presence assessment",
    "customerBase": "Customer base size estimation",
    "marketShare": "Market share assessment",
    "scalability": "Scalability assessment (1-10)"
  },
  "competitorAnalysis": {
    "mainCompetitors": ["List of main competitors"],
    "competitivePosition": "Position vs competitors",
    "differentiators": ["Key differentiators"],
    "marketGap": "Market gap analysis"
  },
  "digitalPresence": {
    "seoStrength": "SEO strength assessment (1-10)",
    "contentStrategy": "Content strategy evaluation",
    "onlineReputation": "Online reputation score (1-10)",
    "digitalMarketing": "Digital marketing effectiveness (1-10)"
  },
  "innovation": {
    "innovationScore": "Innovation score (1-10)",
    "rdInvestment": "R&D investment assessment",
    "patents": "Patent portfolio status",
    "techStack": "Technology stack modernity (1-10)"
  },
  "riskAssessment": {
    "businessRisks": ["List of business risks"],
    "marketRisks": ["List of market risks"],
    "technicalRisks": ["List of technical risks"],
    "overallRisk": "Overall risk level (Low/Medium/High)"
  },
  "benchmarkMetrics": {
    "industryRanking": "Estimated industry ranking",
    "performanceVsIndustry": "Performance vs industry average",
    "growthRate": "Estimated growth rate",
    "marketPenetration": "Market penetration level"
  },
  "recommendations": ["List of strategic recommendations"]
}

Provide only the JSON response without any additional text.`;

    try {
      const models = [
        'mistralai/mistral-7b-instruct:free',
        'huggingface/zephyr-7b-beta:free',
        'meta-llama/llama-3.2-3b-instruct:free',
        'google/gemma-7b-it:free'
      ];

      let lastError;
      
      for (const model of models) {
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': window.location.origin,
              'X-Title': 'AI Website Analyzer'
            },
            body: JSON.stringify({
              model: model,
              messages: [
                {
                  role: 'user',
                  content: prompt
                }
              ],
              max_tokens: 2000,
              temperature: 0.7
            })
          });

          if (!response.ok) {
            lastError = new Error(`API request failed: ${response.status} - ${response.statusText}`);
            console.log(`Model ${model} failed with ${response.status}, trying next...`);
            continue;
          }

          const data = await response.json();
          const aiResponse = data.choices[0]?.message?.content;
          
          if (!aiResponse) {
            lastError = new Error('No response from AI');
            continue;
          }

          try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              return JSON.parse(jsonMatch[0]);
            } else {
              throw new Error('Invalid JSON response');
            }
          } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            lastError = new Error('Failed to parse AI response');
            continue;
          }
        } catch (error) {
          lastError = error;
          console.log(`Error with model ${model}:`, error);
          continue;
        }
      }
      
      throw lastError || new Error('All models failed');
    } catch (error) {
      console.error('AI analysis error:', error);
      throw error;
    }
  };

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      let formattedUrl = url;
      if (!formattedUrl.match(/^https?:\/\//)) {
        formattedUrl = 'https://' + formattedUrl;
      }

      const content = await fetchWebsiteContent(formattedUrl);
      const result = await analyzeWithAI(content, formattedUrl);
      setAnalysis(result);
    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const ScoreBar = ({ score, label }) => (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{score}/10</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            score >= 8 ? 'bg-green-500' : score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Globe className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">AI Website Analyzer</h1>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter website URL (e.g., apple.com)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                onKeyPress={(e) => e.key === 'Enter' && !isAnalyzing && handleAnalyze()}
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[140px]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Analyze
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
              <XCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Company Overview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Building2 className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Company Overview</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{analysis.companyName}</h3>
                  <p className="text-gray-600">{analysis.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Industry:</span>
                    <p className="text-gray-600">{analysis.industry}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Founded:</span>
                    <p className="text-gray-600">{analysis.foundedYear}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Size:</span>
                    <p className="text-gray-600">{analysis.companySize}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Revenue:</span>
                    <p className="text-gray-600">{analysis.revenue}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Phone className="h-6 w-6 text-green-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-700">{analysis.headquarters}</span>
                </div>
                {analysis.contactInfo?.email && (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">{analysis.contactInfo.email}</span>
                  </div>
                )}
                {analysis.contactInfo?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">{analysis.contactInfo.phone}</span>
                  </div>
                )}
                {analysis.contactInfo?.address && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <span className="text-gray-700">{analysis.contactInfo.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Website Quality Metrics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Website Quality</h2>
              </div>
              <div className="space-y-4">
                <ScoreBar score={analysis.websiteQuality?.design || 0} label="Design Quality" />
                <ScoreBar score={analysis.websiteQuality?.userExperience || 0} label="User Experience" />
                <ScoreBar score={analysis.websiteQuality?.contentQuality || 0} label="Content Quality" />
                <ScoreBar score={analysis.websiteQuality?.technicalSEO || 0} label="Technical SEO" />
                <ScoreBar score={analysis.websiteQuality?.mobileOptimization || 0} label="Mobile Optimization" />
                <ScoreBar score={analysis.websiteQuality?.loadingSpeed || 0} label="Loading Speed" />
              </div>
            </div>

            {/* Financial Health */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <DollarSign className="h-6 w-6 text-green-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Financial Health</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-700">Profitability:</span>
                  <p className="text-gray-600">{analysis.financialHealth?.profitability}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Funding Status:</span>
                  <p className="text-gray-600">{analysis.financialHealth?.fundingStatus}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Valuation:</span>
                  <p className="text-gray-600">{analysis.financialHealth?.valuation}</p>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700">Financial Stability:</span>
                  <span className="ml-2 text-lg font-bold text-green-600">{analysis.financialHealth?.financialStability}/10</span>
                </div>
              </div>
            </div>

            {/* Operational Metrics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Operational Metrics</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-700">Team Size:</span>
                  <p className="text-gray-600">{analysis.operationalMetrics?.teamSize}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Global Presence:</span>
                  <p className="text-gray-600">{analysis.operationalMetrics?.globalPresence}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Customer Base:</span>
                  <p className="text-gray-600">{analysis.operationalMetrics?.customerBase}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Market Share:</span>
                  <p className="text-gray-600">{analysis.operationalMetrics?.marketShare}</p>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700">Scalability:</span>
                  <span className="ml-2 text-lg font-bold text-blue-600">{analysis.operationalMetrics?.scalability}/10</span>
                </div>
              </div>
            </div>

            {/* Competitor Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Target className="h-6 w-6 text-red-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Competitor Analysis</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Main Competitors:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.competitorAnalysis?.mainCompetitors?.map((competitor, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        {competitor}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Competitive Position:</span>
                  <p className="text-gray-600">{analysis.competitorAnalysis?.competitivePosition}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Key Differentiators:</h4>
                  <ul className="space-y-1">
                    {analysis.competitorAnalysis?.differentiators?.map((diff, index) => (
                      <li key={index} className="text-gray-600 flex items-start">
                        <Award className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        {diff}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Market Gap:</span>
                  <p className="text-gray-600">{analysis.competitorAnalysis?.marketGap}</p>
                </div>
              </div>
            </div>

            {/* Digital Presence */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Eye className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Digital Presence</h2>
              </div>
              <div className="space-y-4">
                <ScoreBar score={analysis.digitalPresence?.seoStrength || 0} label="SEO Strength" />
                <ScoreBar score={analysis.digitalPresence?.onlineReputation || 0} label="Online Reputation" />
                <ScoreBar score={analysis.digitalPresence?.digitalMarketing || 0} label="Digital Marketing" />
                <div>
                  <span className="font-semibold text-gray-700">Content Strategy:</span>
                  <p className="text-gray-600">{analysis.digitalPresence?.contentStrategy}</p>
                </div>
              </div>
            </div>

            {/* Innovation */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Brain className="h-6 w-6 text-pink-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Innovation</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700">Innovation Score:</span>
                  <span className="ml-2 text-lg font-bold text-pink-600">{analysis.innovation?.innovationScore}/10</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">R&D Investment:</span>
                  <p className="text-gray-600">{analysis.innovation?.rdInvestment}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Patents:</span>
                  <p className="text-gray-600">{analysis.innovation?.patents}</p>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700">Tech Stack Modernity:</span>
                  <span className="ml-2 text-lg font-bold text-pink-600">{analysis.innovation?.techStack}/10</span>
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-orange-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Risk Assessment</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Business Risks:</h4>
                  <ul className="space-y-1">
                    {analysis.riskAssessment?.businessRisks?.map((risk, index) => (
                      <li key={index} className="text-gray-600 flex items-start">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Market Risks:</h4>
                  <ul className="space-y-1">
                    {analysis.riskAssessment?.marketRisks?.map((risk, index) => (
                      <li key={index} className="text-gray-600 flex items-start">
                        <TrendingDown className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Technical Risks:</h4>
                  <ul className="space-y-1">
                    {analysis.riskAssessment?.technicalRisks?.map((risk, index) => (
                      <li key={index} className="text-gray-600 flex items-start">
                        <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700">Overall Risk Level:</span>
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
                    analysis.riskAssessment?.overallRisk === 'Low' ? 'bg-green-100 text-green-800' :
                    analysis.riskAssessment?.overallRisk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {analysis.riskAssessment?.overallRisk}
                  </span>
                </div>
              </div>
            </div>

            {/* Benchmark Metrics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <PieChart className="h-6 w-6 text-indigo-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Benchmark Metrics</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-700">Industry Ranking:</span>
                  <p className="text-gray-600">{analysis.benchmarkMetrics?.industryRanking}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Performance vs Industry:</span>
                  <p className="text-gray-600">{analysis.benchmarkMetrics?.performanceVsIndustry}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Growth Rate:</span>
                  <p className="text-gray-600">{analysis.benchmarkMetrics?.growthRate}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Market Penetration:</span>
                  <p className="text-gray-600">{analysis.benchmarkMetrics?.marketPenetration}</p>
                </div>
              </div>
            </div>

            {/* Products & Services */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Zap className="h-6 w-6 text-orange-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Products & Services</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Main Offerings:</h4>
                  <ul className="space-y-1">
                    {analysis.products?.map((product, index) => (
                      <li key={index} className="text-gray-600 flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {product}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Target Market:</h4>
                  <p className="text-gray-600">{analysis.targetMarket}</p>
                </div>
              </div>
            </div>

            {/* Market Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Market Analysis</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Business Model:</h4>
                  <p className="text-gray-600">{analysis.businessModel}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Market Position:</h4>
                  <p className="text-gray-600">{analysis.marketPosition}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Growth Potential:</h4>
                  <p className="text-gray-600">{analysis.growthPotential}</p>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-semibold text-gray-700">Trust Score:</span>
                  <span className="ml-2 text-2xl font-bold text-green-600">{analysis.trustScore}/10</span>
                </div>
              </div>
            </div>

            {/* Technologies & Recommendations */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Star className="h-6 w-6 text-yellow-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Insights & Tech</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Technologies:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.technologies?.map((tech, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Competitive Advantages:</h4>
                  <ul className="space-y-1">
                    {analysis.competitiveAdvantages?.map((advantage, index) => (
                      <li key={index} className="text-gray-600 flex items-start">
                        <Star className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        {advantage}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Recommendations:</h4>
                  <ul className="space-y-1">
                    {analysis.recommendations?.map((rec, index) => (
                      <li key={index} className="text-gray-600 flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteAnalyzer;