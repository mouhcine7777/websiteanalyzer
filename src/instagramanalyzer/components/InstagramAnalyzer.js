import React, { useState } from 'react';
import { Instagram, Search, Loader2, Users, Heart, MessageCircle, Share, TrendingUp, Calendar, Star, Award, Target, BarChart3 } from 'lucide-react';

const InstagramAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const OPENROUTER_API_KEY = '';

  const extractInstagramData = async (profileUrl) => {
    try {
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(profileUrl)}`);
      if (!response.ok) throw new Error('Failed to fetch Instagram profile');
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract visible text content
      const scripts = doc.querySelectorAll('script, style');
      scripts.forEach(el => el.remove());
      
      const textContent = doc.body?.textContent || doc.textContent || '';
      return textContent.substring(0, 6000);
    } catch (error) {
      console.error('Error fetching Instagram data:', error);
      throw error;
    }
  };

  const analyzeWithAI = async (content, profileUrl) => {
    const prompt = `Analyze this Instagram profile data and provide insights. Profile URL: ${profileUrl}

Content: ${content}

Provide a JSON response with this structure:
{
  "username": "Instagram username",
  "displayName": "Display name",
  "bio": "Bio description",
  "category": "Account category/niche",
  "followers": "Estimated followers count",
  "following": "Estimated following count",
  "posts": "Estimated posts count",
  "engagement": {
    "rate": "Engagement rate estimate (1-10)",
    "quality": "Content quality score (1-10)",
    "consistency": "Posting consistency score (1-10)"
  },
  "audience": {
    "targetDemographic": "Target audience description",
    "location": "Primary audience location",
    "interests": ["List of audience interests"]
  },
  "content": {
    "type": "Primary content type",
    "themes": ["Main content themes"],
    "style": "Content style description"
  },
  "brandAnalysis": {
    "brandStrength": "Brand strength score (1-10)",
    "niche": "Niche analysis",
    "uniqueness": "What makes this account unique",
    "monetization": "Monetization potential assessment"
  },
  "growth": {
    "potential": "Growth potential (1-10)",
    "strategy": "Recommended growth strategy",
    "opportunities": ["Growth opportunities"]
  },
  "competitors": ["Similar accounts/competitors"],
  "recommendations": ["Strategic recommendations"]
}

Return only the JSON response.`;

    try {
      const models = ['mistralai/mistral-7b-instruct:free', 'meta-llama/llama-3.2-3b-instruct:free'];
      
      for (const model of models) {
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: model,
              messages: [{ role: 'user', content: prompt }],
              max_tokens: 1500,
              temperature: 0.7
            })
          });

          if (!response.ok) continue;

          const data = await response.json();
          const aiResponse = data.choices[0]?.message?.content;
          
          if (aiResponse) {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              return JSON.parse(jsonMatch[0]);
            }
          }
        } catch (error) {
          console.log(`Error with model ${model}:`, error);
          continue;
        }
      }
      
      throw new Error('AI analysis failed');
    } catch (error) {
      console.error('AI analysis error:', error);
      throw error;
    }
  };

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Please enter a valid Instagram URL');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      let formattedUrl = url;
      if (!formattedUrl.includes('instagram.com')) {
        formattedUrl = `https://instagram.com/${url.replace('@', '')}`;
      }

      const content = await extractInstagramData(formattedUrl);
      const result = await analyzeWithAI(content, formattedUrl);
      setAnalysis(result);
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const ScoreCircle = ({ score, label, color = 'blue' }) => (
    <div className="text-center">
      <div className={`w-16 h-16 rounded-full bg-${color}-100 flex items-center justify-center mx-auto mb-2`}>
        <span className={`text-2xl font-bold text-${color}-600`}>{score}</span>
      </div>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Instagram className="h-12 w-12 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">AI Instagram Analyzer</h1>
          </div>
          <p className="text-gray-600">Analyze any Instagram profile and get detailed insights</p>
        </div>

        {/* Input */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter Instagram URL or username (e.g., @username)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              onKeyPress={(e) => e.key === 'Enter' && !isAnalyzing && handleAnalyze()}
            />
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Profile Overview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Profile Overview</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-2xl font-bold text-purple-600">@{analysis.username}</h3>
                  <p className="text-lg text-gray-800">{analysis.displayName}</p>
                  <p className="text-gray-600 mt-2">{analysis.bio}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{analysis.followers}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{analysis.following}</div>
                    <div className="text-sm text-gray-600">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{analysis.posts}</div>
                    <div className="text-sm text-gray-600">Posts</div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <span className="font-semibold text-purple-800">Category: </span>
                  <span className="text-purple-600">{analysis.category}</span>
                </div>
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Heart className="h-6 w-6 text-red-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Engagement Metrics</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <ScoreCircle score={analysis.engagement?.rate || 0} label="Engagement Rate" color="red" />
                <ScoreCircle score={analysis.engagement?.quality || 0} label="Content Quality" color="green" />
                <ScoreCircle score={analysis.engagement?.consistency || 0} label="Consistency" color="blue" />
              </div>
            </div>

            {/* Content Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Content Analysis</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-700">Content Type: </span>
                  <span className="text-gray-600">{analysis.content?.type}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Style: </span>
                  <span className="text-gray-600">{analysis.content?.style}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Main Themes:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.content?.themes?.map((theme, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Award className="h-6 w-6 text-yellow-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Brand Analysis</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700">Brand Strength: </span>
                  <span className="ml-2 text-2xl font-bold text-yellow-600">{analysis.brandAnalysis?.brandStrength}/10</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Niche: </span>
                  <span className="text-gray-600">{analysis.brandAnalysis?.niche}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Unique Value: </span>
                  <p className="text-gray-600 mt-1">{analysis.brandAnalysis?.uniqueness}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Monetization: </span>
                  <p className="text-gray-600 mt-1">{analysis.brandAnalysis?.monetization}</p>
                </div>
              </div>
            </div>

            {/* Audience Insights */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Target className="h-6 w-6 text-green-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Audience Insights</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-700">Target Demographic: </span>
                  <p className="text-gray-600">{analysis.audience?.targetDemographic}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Location: </span>
                  <span className="text-gray-600">{analysis.audience?.location}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Interests:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.audience?.interests?.map((interest, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Growth Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Growth Analysis</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700">Growth Potential: </span>
                  <span className="ml-2 text-2xl font-bold text-purple-600">{analysis.growth?.potential}/10</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Strategy: </span>
                  <p className="text-gray-600">{analysis.growth?.strategy}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Opportunities:</span>
                  <ul className="mt-2 space-y-1">
                    {analysis.growth?.opportunities?.map((opp, index) => (
                      <li key={index} className="text-gray-600 flex items-start">
                        <Star className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        {opp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Competitors & Recommendations */}
            <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Similar Accounts</h3>
                  <div className="space-y-2">
                    {analysis.competitors?.map((competitor, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">@{competitor}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {analysis.recommendations?.map((rec, index) => (
                      <li key={index} className="text-gray-600 flex items-start">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
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

export default InstagramAnalyzer;