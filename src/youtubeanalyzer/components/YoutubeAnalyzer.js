import React, { useState } from 'react';
import { Youtube, Search, Loader2, Users, Heart, MessageCircle, Share, TrendingUp, Calendar, Star, Award, Target, BarChart3, Play, Eye, Clock, Trophy } from 'lucide-react';

const YouTubeAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const OPENROUTER_API_KEY = '';

  const extractYouTubeData = async (channelUrl) => {
    try {
      // Try multiple proxy services for better reliability
      const proxies = [
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://cors-anywhere.herokuapp.com/',
        'https://thingproxy.freeboard.io/fetch/'
      ];
      
      let content = '';
      
      for (const proxy of proxies) {
        try {
          const response = await fetch(`${proxy}${encodeURIComponent(channelUrl)}`);
          if (response.ok) {
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Remove scripts and styles
            const scripts = doc.querySelectorAll('script, style');
            scripts.forEach(el => el.remove());
            
            // Extract text content
            const textContent = doc.body?.textContent || doc.textContent || '';
            
            // Look for specific YouTube metadata
            const titleElement = doc.querySelector('title');
            const metaDescription = doc.querySelector('meta[name="description"]');
            const metaKeywords = doc.querySelector('meta[name="keywords"]');
            
            content = `Title: ${titleElement?.textContent || 'Unknown'}
            Description: ${metaDescription?.content || 'No description'}
            Keywords: ${metaKeywords?.content || 'No keywords'}
            
            Page Content:
            ${textContent.substring(0, 8000)}`;
            
            if (content.length > 100) {
              return content;
            }
          }
        } catch (error) {
          console.log(`Proxy ${proxy} failed:`, error);
          continue;
        }
      }
      
      // If all proxies fail, try direct fetch (might be blocked by CORS)
      try {
        const response = await fetch(channelUrl);
        if (response.ok) {
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          const scripts = doc.querySelectorAll('script, style');
          scripts.forEach(el => el.remove());
          
          const textContent = doc.body?.textContent || doc.textContent || '';
          return textContent.substring(0, 8000);
        }
      } catch (error) {
        console.log('Direct fetch failed:', error);
      }
      
      throw new Error('Unable to fetch channel data. Please try a different URL or check if the channel is public.');
      
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
      throw error;
    }
  };

  const analyzeWithAI = async (content, channelUrl) => {
    const prompt = `Analyze this YouTube channel data and provide insights. Channel URL: ${channelUrl}

Content: ${content}

Provide a JSON response with this structure:
{
  "channelName": "YouTube channel name",
  "channelHandle": "Channel handle (@username)",
  "description": "Channel description",
  "category": "Channel category/niche",
  "subscribers": "Estimated subscribers count",
  "totalVideos": "Estimated total videos",
  "totalViews": "Estimated total views",
  "joinDate": "Channel creation date estimate",
  "metrics": {
    "avgViews": "Average views per video estimate",
    "avgLikes": "Average likes per video estimate",
    "avgComments": "Average comments per video estimate",
    "engagementRate": "Engagement rate score (1-10)",
    "uploadFrequency": "Upload frequency score (1-10)",
    "contentQuality": "Content quality score (1-10)"
  },
  "audience": {
    "targetDemographic": "Target audience description",
    "primaryLocation": "Primary audience location",
    "interests": ["List of audience interests"],
    "ageRange": "Primary age range"
  },
  "content": {
    "type": "Primary content type",
    "format": "Video format style",
    "themes": ["Main content themes"],
    "style": "Content style description",
    "duration": "Typical video length"
  },
  "performance": {
    "trendingPotential": "Trending potential score (1-10)",
    "viralContent": "Viral content analysis",
    "bestPerformingType": "Best performing content type",
    "peakTimes": "Best posting times"
  },
  "monetization": {
    "potential": "Monetization potential score (1-10)",
    "currentMethods": ["Current monetization methods"],
    "opportunities": ["Monetization opportunities"],
    "revenueEstimate": "Monthly revenue estimate range"
  },
  "growth": {
    "potential": "Growth potential score (1-10)",
    "strategy": "Recommended growth strategy",
    "opportunities": ["Growth opportunities"],
    "challenges": ["Growth challenges"]
  },
  "competitors": ["Similar YouTube channels"],
  "recommendations": ["Strategic recommendations for improvement"]
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
              max_tokens: 2000,
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
      setError('Please enter a valid YouTube channel URL');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      let formattedUrl = url;
      if (!formattedUrl.includes('youtube.com')) {
        formattedUrl = `https://youtube.com/@${url.replace('@', '')}`;
      }

      const content = await extractYouTubeData(formattedUrl);
      const result = await analyzeWithAI(content, formattedUrl);
      setAnalysis(result);
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const ScoreCircle = ({ score, label, color = 'red' }) => (
    <div className="text-center">
      <div className={`w-16 h-16 rounded-full bg-${color}-100 flex items-center justify-center mx-auto mb-2`}>
        <span className={`text-2xl font-bold text-${color}-600`}>{score}</span>
      </div>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Youtube className="h-12 w-12 text-red-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">AI YouTube Analyzer</h1>
          </div>
          <p className="text-gray-600">Analyze any YouTube channel and get comprehensive insights</p>
        </div>

        {/* Input */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter YouTube channel URL or handle (e.g., @channelname)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              onKeyPress={(e) => e.key === 'Enter' && !isAnalyzing && handleAnalyze()}
            />
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
            
            {/* Channel Overview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Youtube className="h-6 w-6 text-red-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Channel Overview</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-2xl font-bold text-red-600">{analysis.channelName}</h3>
                  <p className="text-lg text-gray-800">{analysis.channelHandle}</p>
                  <p className="text-gray-600 mt-2">{analysis.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{analysis.subscribers}</div>
                    <div className="text-sm text-gray-600">Subscribers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{analysis.totalVideos}</div>
                    <div className="text-sm text-gray-600">Videos</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{analysis.totalViews}</div>
                  <div className="text-sm text-gray-600">Total Views</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <span className="font-semibold text-red-800">Category: </span>
                  <span className="text-red-600">{analysis.category}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="font-semibold text-gray-800">Joined: </span>
                  <span className="text-gray-600">{analysis.joinDate}</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Performance Metrics</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <ScoreCircle score={analysis.metrics?.engagementRate || 0} label="Engagement" color="red" />
                  <ScoreCircle score={analysis.metrics?.uploadFrequency || 0} label="Upload Frequency" color="green" />
                  <ScoreCircle score={analysis.metrics?.contentQuality || 0} label="Content Quality" color="blue" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Views:</span>
                    <span className="font-semibold">{analysis.metrics?.avgViews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Likes:</span>
                    <span className="font-semibold">{analysis.metrics?.avgLikes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Comments:</span>
                    <span className="font-semibold">{analysis.metrics?.avgComments}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Play className="h-6 w-6 text-green-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Content Analysis</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-700">Content Type: </span>
                  <span className="text-gray-600">{analysis.content?.type}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Format: </span>
                  <span className="text-gray-600">{analysis.content?.format}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Typical Duration: </span>
                  <span className="text-gray-600">{analysis.content?.duration}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Style: </span>
                  <span className="text-gray-600">{analysis.content?.style}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Main Themes:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.content?.themes?.map((theme, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Performance Insights</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700">Trending Potential: </span>
                  <span className="ml-2 text-2xl font-bold text-purple-600">{analysis.performance?.trendingPotential}/10</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Best Content Type: </span>
                  <span className="text-gray-600">{analysis.performance?.bestPerformingType}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Viral Content: </span>
                  <p className="text-gray-600 mt-1">{analysis.performance?.viralContent}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Best Posting Times: </span>
                  <span className="text-gray-600">{analysis.performance?.peakTimes}</span>
                </div>
              </div>
            </div>

            {/* Monetization Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Trophy className="h-6 w-6 text-yellow-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Monetization</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700">Potential: </span>
                  <span className="ml-2 text-2xl font-bold text-yellow-600">{analysis.monetization?.potential}/10</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Revenue Estimate: </span>
                  <span className="text-gray-600">{analysis.monetization?.revenueEstimate}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Current Methods:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.monetization?.currentMethods?.map((method, index) => (
                      <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Opportunities:</span>
                  <ul className="mt-2 space-y-1">
                    {analysis.monetization?.opportunities?.map((opp, index) => (
                      <li key={index} className="text-gray-600 flex items-start">
                        <Star className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        {opp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Audience Insights */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Target className="h-6 w-6 text-indigo-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Audience Insights</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-700">Target Demographic: </span>
                  <p className="text-gray-600">{analysis.audience?.targetDemographic}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Age Range: </span>
                  <span className="text-gray-600">{analysis.audience?.ageRange}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Location: </span>
                  <span className="text-gray-600">{analysis.audience?.primaryLocation}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Interests:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.audience?.interests?.map((interest, index) => (
                      <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Growth Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
              <div className="flex items-center mb-4">
                <Award className="h-6 w-6 text-orange-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Growth Analysis</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-3">
                    <span className="font-semibold text-gray-700">Growth Potential: </span>
                    <span className="ml-2 text-2xl font-bold text-orange-600">{analysis.growth?.potential}/10</span>
                  </div>
                  <div className="mb-4">
                    <span className="font-semibold text-gray-700">Strategy: </span>
                    <p className="text-gray-600">{analysis.growth?.strategy}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Opportunities:</span>
                    <ul className="mt-2 space-y-1">
                      {analysis.growth?.opportunities?.map((opp, index) => (
                        <li key={index} className="text-gray-600 flex items-start">
                          <Star className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                          {opp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <span className="font-semibold text-gray-700">Challenges:</span>
                    <ul className="mt-2 space-y-1">
                      {analysis.growth?.challenges?.map((challenge, index) => (
                        <li key={index} className="text-gray-600 flex items-start">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Competitors & Recommendations */}
            <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Similar Channels</h3>
                  <div className="space-y-2">
                    {analysis.competitors?.map((competitor, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg flex items-center">
                        <Youtube className="h-5 w-5 text-red-600 mr-2" />
                        <span className="text-gray-700">{competitor}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {analysis.recommendations?.map((rec, index) => (
                      <li key={index} className="text-gray-600 flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
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

export default YouTubeAnalyzer;