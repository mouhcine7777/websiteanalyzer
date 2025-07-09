import React, { useState } from 'react';
import { Download, Globe, Clock, Shield, Zap, Users, Search, FileText, AlertCircle, Loader } from 'lucide-react';

const WebsiteBenchmarkTool = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const normalizeUrl = (inputUrl) => {
    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      return 'https://' + inputUrl;
    }
    return inputUrl;
  };

  const analyzeWebsite = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);
    
    const normalizedUrl = normalizeUrl(url.trim());

    try {
      setProgress('Fetching website content...');
      
      // Fetch the actual website content
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(normalizedUrl)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const htmlContent = await response.text();
      
      setProgress('Analyzing website structure...');
      
      // Parse HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Extract real data from the website
      const realAnalysis = await extractRealData(normalizedUrl, doc, htmlContent);
      
      setProgress('Generating report...');
      
      setAnalysis(realAnalysis);
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError(`Failed to analyze website: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
      setProgress('');
    }
  };

  const extractRealData = async (url, doc, htmlContent) => {
    setProgress('Extracting metadata...');
    
    // Extract title
    const title = doc.querySelector('title')?.textContent || 'No title found';
    
    // Extract meta description
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || 'No meta description';
    
    // Extract meta keywords
    const metaKeywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || 'No keywords';
    
    // Count headings
    const h1Count = doc.querySelectorAll('h1').length;
    const h2Count = doc.querySelectorAll('h2').length;
    const h3Count = doc.querySelectorAll('h3').length;
    
    // Count images and check alt text
    const images = doc.querySelectorAll('img');
    const imagesWithAlt = Array.from(images).filter(img => img.getAttribute('alt'));
    
    // Count links
    const links = doc.querySelectorAll('a').length;
    const externalLinks = Array.from(doc.querySelectorAll('a'))
      .filter(link => {
        const href = link.getAttribute('href');
        return href && (href.startsWith('http') && !href.includes(new URL(url).hostname));
      }).length;
    
    // Check for common technologies
    const technologies = detectTechnologies(htmlContent);
    
    // Check for social media links
    const socialMedia = detectSocialMedia(doc);
    
    // Analyze forms
    const forms = doc.querySelectorAll('form').length;
    
    // Check for HTTPS
    const isHttps = url.startsWith('https://');
    
    // Calculate content size
    const contentSize = new Blob([htmlContent]).size;
    
    // Count words in visible text
    const textContent = doc.body?.textContent || '';
    const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    // Check for structured data
    const structuredData = doc.querySelectorAll('script[type="application/ld+json"]').length;
    
    // Check for common SEO elements
    const canonicalLink = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
    const metaRobots = doc.querySelector('meta[name="robots"]')?.getAttribute('content');
    
    // Check for favicon
    const favicon = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]') !== null;
    
    // Check for viewport meta tag
    const viewportMeta = doc.querySelector('meta[name="viewport"]') !== null;
    
    // Calculate scores
    const seoScore = calculateSEOScore({
      hasTitle: title !== 'No title found',
      hasMetaDescription: metaDescription !== 'No meta description',
      hasH1: h1Count > 0,
      hasCanonical: canonicalLink !== undefined,
      hasMetaRobots: metaRobots !== undefined,
      hasStructuredData: structuredData > 0
    });
    
    const accessibilityScore = calculateAccessibilityScore({
      altTextCoverage: images.length > 0 ? (imagesWithAlt.length / images.length) * 100 : 100,
      hasViewport: viewportMeta,
      hasHeadings: h1Count > 0 || h2Count > 0 || h3Count > 0
    });
    
    const securityScore = calculateSecurityScore({
      isHttps: isHttps,
      hasMetaRobots: metaRobots !== undefined
    });
    
    const performanceScore = calculatePerformanceScore({
      contentSize: contentSize,
      imageCount: images.length
    });

    return {
      url: url,
      title: title,
      analyzedAt: new Date().toLocaleString(),
      performance: {
        contentSize: `${Math.round(contentSize / 1024)}KB`,
        imageCount: images.length,
        linkCount: links,
        wordCount: wordCount,
        score: performanceScore
      },
      seo: {
        title: title,
        metaDescription: metaDescription.substring(0, 160) + (metaDescription.length > 160 ? '...' : ''),
        metaKeywords: metaKeywords,
        headings: `H1: ${h1Count}, H2: ${h2Count}, H3: ${h3Count}`,
        canonicalLink: canonicalLink || 'Not found',
        structuredData: structuredData > 0 ? `${structuredData} found` : 'None found',
        score: seoScore
      },
      security: {
        https: isHttps,
        protocol: isHttps ? 'HTTPS' : 'HTTP',
        metaRobots: metaRobots || 'Not specified',
        score: securityScore
      },
      accessibility: {
        altTextCoverage: `${imagesWithAlt.length}/${images.length} images`,
        altTextPercentage: images.length > 0 ? Math.round((imagesWithAlt.length / images.length) * 100) : 100,
        viewportMeta: viewportMeta ? 'Present' : 'Missing',
        favicon: favicon ? 'Present' : 'Missing',
        score: accessibilityScore
      },
      technology: {
        detectedTech: technologies.join(', ') || 'Unable to detect',
        forms: forms,
        externalLinks: externalLinks,
        structuredData: structuredData
      },
      content: {
        wordCount: wordCount,
        images: images.length,
        links: links,
        forms: forms,
        lastAnalyzed: new Date().toLocaleString()
      },
      social: socialMedia,
      recommendations: generateRecommendations({
        seoScore,
        accessibilityScore,
        securityScore,
        performanceScore,
        hasMetaDescription: metaDescription !== 'No meta description',
        altTextCoverage: images.length > 0 ? (imagesWithAlt.length / images.length) * 100 : 100,
        isHttps
      })
    };
  };

  const detectTechnologies = (htmlContent) => {
    const technologies = [];
    
    if (htmlContent.includes('wp-content') || htmlContent.includes('wp-includes')) {
      technologies.push('WordPress');
    }
    if (htmlContent.includes('react') || htmlContent.includes('React')) {
      technologies.push('React');
    }
    if (htmlContent.includes('vue') || htmlContent.includes('Vue')) {
      technologies.push('Vue.js');
    }
    if (htmlContent.includes('angular') || htmlContent.includes('Angular')) {
      technologies.push('Angular');
    }
    if (htmlContent.includes('jquery') || htmlContent.includes('jQuery')) {
      technologies.push('jQuery');
    }
    if (htmlContent.includes('bootstrap')) {
      technologies.push('Bootstrap');
    }
    if (htmlContent.includes('google-analytics') || htmlContent.includes('gtag')) {
      technologies.push('Google Analytics');
    }
    if (htmlContent.includes('shopify')) {
      technologies.push('Shopify');
    }
    
    return technologies;
  };

  const detectSocialMedia = (doc) => {
    const social = {};
    
    const links = Array.from(doc.querySelectorAll('a'));
    
    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.includes('facebook.com')) social.facebook = 'Found';
      if (href.includes('twitter.com') || href.includes('x.com')) social.twitter = 'Found';
      if (href.includes('instagram.com')) social.instagram = 'Found';
      if (href.includes('linkedin.com')) social.linkedin = 'Found';
      if (href.includes('youtube.com')) social.youtube = 'Found';
      if (href.includes('tiktok.com')) social.tiktok = 'Found';
    });
    
    return {
      facebook: social.facebook || 'Not found',
      twitter: social.twitter || 'Not found',
      instagram: social.instagram || 'Not found',
      linkedin: social.linkedin || 'Not found',
      youtube: social.youtube || 'Not found',
      tiktok: social.tiktok || 'Not found'
    };
  };

  const calculateSEOScore = ({ hasTitle, hasMetaDescription, hasH1, hasCanonical, hasMetaRobots, hasStructuredData }) => {
    let score = 0;
    if (hasTitle) score += 20;
    if (hasMetaDescription) score += 20;
    if (hasH1) score += 15;
    if (hasCanonical) score += 15;
    if (hasMetaRobots) score += 15;
    if (hasStructuredData) score += 15;
    return score;
  };

  const calculateAccessibilityScore = ({ altTextCoverage, hasViewport, hasHeadings }) => {
    let score = 0;
    score += Math.min(altTextCoverage, 50); // Max 50 points for alt text
    if (hasViewport) score += 25;
    if (hasHeadings) score += 25;
    return Math.round(score);
  };

  const calculateSecurityScore = ({ isHttps, hasMetaRobots }) => {
    let score = 0;
    if (isHttps) score += 70;
    if (hasMetaRobots) score += 30;
    return score;
  };

  const calculatePerformanceScore = ({ contentSize, imageCount }) => {
    let score = 100;
    
    // Deduct points for large content size
    if (contentSize > 1024 * 1024) score -= 30; // > 1MB
    else if (contentSize > 512 * 1024) score -= 15; // > 512KB
    
    // Deduct points for too many images
    if (imageCount > 50) score -= 20;
    else if (imageCount > 20) score -= 10;
    
    return Math.max(score, 0);
  };

  const generateRecommendations = ({ seoScore, accessibilityScore, securityScore, performanceScore, hasMetaDescription, altTextCoverage, isHttps }) => {
    const recommendations = [];
    
    if (seoScore < 80) {
      recommendations.push('Improve SEO by adding missing meta tags and structured data');
    }
    if (!hasMetaDescription) {
      recommendations.push('Add a meta description to improve search engine visibility');
    }
    if (altTextCoverage < 80) {
      recommendations.push('Add alt text to more images for better accessibility');
    }
    if (!isHttps) {
      recommendations.push('Implement HTTPS for better security and SEO');
    }
    if (performanceScore < 70) {
      recommendations.push('Optimize images and reduce page size for better performance');
    }
    if (accessibilityScore < 70) {
      recommendations.push('Improve accessibility with better semantic HTML and navigation');
    }
    
    return recommendations;
  };

  const generatePDF = () => {
    if (!analysis) return;

    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Website Benchmark Report - ${analysis.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; line-height: 1.6; }
          .header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #3b82f6; margin: 0; }
          .section { margin-bottom: 30px; page-break-inside: avoid; }
          .section h2 { color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
          .metric { display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; }
          .score { font-weight: bold; color: #059669; }
          .score.warning { color: #d97706; }
          .score.danger { color: #dc2626; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
          .card h3 { margin-top: 0; color: #374151; }
          .recommendations { background-color: #f9fafb; padding: 15px; border-radius: 8px; }
          .recommendations ul { margin: 10px 0; padding-left: 20px; }
          .recommendations li { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
          th { background-color: #f9fafb; font-weight: bold; }
          .social-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
          .social-item { display: flex; justify-content: space-between; padding: 5px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Website Benchmark Report</h1>
          <p><strong>Website:</strong> ${analysis.title}</p>
          <p><strong>URL:</strong> ${analysis.url}</p>
          <p><strong>Generated:</strong> ${analysis.analyzedAt}</p>
        </div>

        <div class="section">
          <h2>Executive Summary</h2>
          <div class="grid">
            <div class="card">
              <h3>Overall Scores</h3>
              <div class="metric">
                <span>SEO Score:</span>
                <span class="score ${analysis.seo.score >= 80 ? '' : analysis.seo.score >= 60 ? 'warning' : 'danger'}">${analysis.seo.score}/100</span>
              </div>
              <div class="metric">
                <span>Security Score:</span>
                <span class="score ${analysis.security.score >= 80 ? '' : analysis.security.score >= 60 ? 'warning' : 'danger'}">${analysis.security.score}/100</span>
              </div>
              <div class="metric">
                <span>Accessibility Score:</span>
                <span class="score ${analysis.accessibility.score >= 80 ? '' : analysis.accessibility.score >= 60 ? 'warning' : 'danger'}">${analysis.accessibility.score}/100</span>
              </div>
              <div class="metric">
                <span>Performance Score:</span>
                <span class="score ${analysis.performance.score >= 80 ? '' : analysis.performance.score >= 60 ? 'warning' : 'danger'}">${analysis.performance.score}/100</span>
              </div>
            </div>
            <div class="card">
              <h3>Quick Facts</h3>
              <div class="metric">
                <span>Content Size:</span>
                <span>${analysis.performance.contentSize}</span>
              </div>
              <div class="metric">
                <span>Total Images:</span>
                <span>${analysis.content.images}</span>
              </div>
              <div class="metric">
                <span>Word Count:</span>
                <span>${analysis.content.wordCount}</span>
              </div>
              <div class="metric">
                <span>Security Protocol:</span>
                <span class="score ${analysis.security.https ? '' : 'danger'}">${analysis.security.protocol}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>SEO Analysis</h2>
          <div class="card">
            <h3>Meta Information</h3>
            <div class="metric">
              <span>Title:</span>
              <span>${analysis.seo.title}</span>
            </div>
            <div class="metric">
              <span>Meta Description:</span>
              <span>${analysis.seo.metaDescription}</span>
            </div>
            <div class="metric">
              <span>Headings Structure:</span>
              <span>${analysis.seo.headings}</span>
            </div>
            <div class="metric">
              <span>Canonical URL:</span>
              <span>${analysis.seo.canonicalLink}</span>
            </div>
            <div class="metric">
              <span>Structured Data:</span>
              <span>${analysis.seo.structuredData}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Technical Analysis</h2>
          <div class="grid">
            <div class="card">
              <h3>Security</h3>
              <div class="metric">
                <span>HTTPS:</span>
                <span class="score ${analysis.security.https ? '' : 'danger'}">${analysis.security.https ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div class="metric">
                <span>Meta Robots:</span>
                <span>${analysis.security.metaRobots}</span>
              </div>
            </div>
            <div class="card">
              <h3>Accessibility</h3>
              <div class="metric">
                <span>Alt Text Coverage:</span>
                <span class="score ${analysis.accessibility.altTextPercentage >= 80 ? '' : analysis.accessibility.altTextPercentage >= 60 ? 'warning' : 'danger'}">${analysis.accessibility.altTextPercentage}%</span>
              </div>
              <div class="metric">
                <span>Viewport Meta:</span>
                <span class="score ${analysis.accessibility.viewportMeta === 'Present' ? '' : 'warning'}">${analysis.accessibility.viewportMeta}</span>
              </div>
              <div class="metric">
                <span>Favicon:</span>
                <span class="score ${analysis.accessibility.favicon === 'Present' ? '' : 'warning'}">${analysis.accessibility.favicon}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Content Analysis</h2>
          <div class="card">
            <table>
              <tr><th>Metric</th><th>Value</th></tr>
              <tr><td>Total Words</td><td>${analysis.content.wordCount}</td></tr>
              <tr><td>Images</td><td>${analysis.content.images}</td></tr>
              <tr><td>Links</td><td>${analysis.content.links}</td></tr>
              <tr><td>Forms</td><td>${analysis.content.forms}</td></tr>
              <tr><td>External Links</td><td>${analysis.technology.externalLinks}</td></tr>
            </table>
          </div>
        </div>

        <div class="section">
          <h2>Technology Stack</h2>
          <div class="card">
            <div class="metric">
              <span>Detected Technologies:</span>
              <span>${analysis.technology.detectedTech}</span>
            </div>
            <div class="metric">
              <span>Structured Data Elements:</span>
              <span>${analysis.technology.structuredData}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Social Media Presence</h2>
          <div class="card">
            <div class="social-grid">
              <div class="social-item">
                <span>Facebook:</span>
                <span class="score ${analysis.social.facebook === 'Found' ? '' : 'warning'}">${analysis.social.facebook}</span>
              </div>
              <div class="social-item">
                <span>Twitter:</span>
                <span class="score ${analysis.social.twitter === 'Found' ? '' : 'warning'}">${analysis.social.twitter}</span>
              </div>
              <div class="social-item">
                <span>Instagram:</span>
                <span class="score ${analysis.social.instagram === 'Found' ? '' : 'warning'}">${analysis.social.instagram}</span>
              </div>
              <div class="social-item">
                <span>LinkedIn:</span>
                <span class="score ${analysis.social.linkedin === 'Found' ? '' : 'warning'}">${analysis.social.linkedin}</span>
              </div>
              <div class="social-item">
                <span>YouTube:</span>
                <span class="score ${analysis.social.youtube === 'Found' ? '' : 'warning'}">${analysis.social.youtube}</span>
              </div>
              <div class="social-item">
                <span>TikTok:</span>
                <span class="score ${analysis.social.tiktok === 'Found' ? '' : 'warning'}">${analysis.social.tiktok}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Recommendations</h2>
          <div class="recommendations">
            <h3>Priority Actions</h3>
            <ul>
              ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="section">
          <h2>Report Details</h2>
          <p><strong>Analysis Date:</strong> ${analysis.analyzedAt}</p>
          <p><strong>Report Generated By:</strong> Website Benchmark Tool</p>
          <p><strong>Note:</strong> This report provides a snapshot of the website at the time of analysis. Regular monitoring is recommended for optimal performance.</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `website-benchmark-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return 'bg-green-100 border-green-300';
    if (score >= 60) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Real Website Benchmark Tool</h1>
        <p className="text-gray-600">Analyze any website with real data and get comprehensive benchmark reports</p>
      </div>

      {/* URL Input */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL (e.g., example.com or https://example.com)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
          <button
            onClick={analyzeWebsite}
            disabled={isAnalyzing}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            {isAnalyzing ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                Analyze Website
              </>
            )}
          </button>
        </div>
        
        {progress && (
          <div className="mt-4 flex items-center gap-2 text-blue-600">
            <Loader className="h-4 w-4 animate-spin" />
            {progress}
          </div>
        )}
        
        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{analysis.title}</h2>
                <p className="text-gray-600 mb-1">{analysis.url}</p>
                <p className="text-sm text-gray-500">Analyzed on {analysis.analyzedAt}</p>
              </div>
              <button
                onClick={generatePDF}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                <Download className="h-5 w-5" />
                Download Report
              </button>
            </div>
          </div>

          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`p-6 rounded-lg border-2 ${getScoreBackground(analysis.seo.score)}`}>
              <div className="flex items-center gap-3 mb-4">
                <Search className="h-8 w-8 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">SEO</h3>
              </div>
              <div className="text-3xl font-bold mb-2">
                <span className={getScoreColor(analysis.seo.score)}>{analysis.seo.score}/100</span>
              </div>
              <p className="text-sm text-gray-600">Search Engine Optimization</p>
            </div>

            <div className={`p-6 rounded-lg border-2 ${getScoreBackground(analysis.security.score)}`}>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-8 w-8 text-red-600" />
                <h3 className="text-lg font-bold text-gray-900">Security</h3>
              </div>
              <div className="text-3xl font-bold mb-2">
                <span className={getScoreColor(analysis.security.score)}>{analysis.security.score}/100</span>
              </div>
              <p className="text-sm text-gray-600">Security & Privacy</p>
            </div>

            <div className={`p-6 rounded-lg border-2 ${getScoreBackground(analysis.accessibility.score)}`}>
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-8 w-8 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">Accessibility</h3>
              </div>
              <div className="text-3xl font-bold mb-2">
                <span className={getScoreColor(analysis.accessibility.score)}>{analysis.accessibility.score}/100</span>
              </div>
              <p className="text-sm text-gray-600">User Accessibility</p>
            </div>

            <div className={`p-6 rounded-lg border-2 ${getScoreBackground(analysis.performance.score)}`}>
              <div className="flex items-center gap-3 mb-4">
                <Zap className="h-8 w-8 text-yellow-600" />
                <h3 className="text-lg font-bold text-gray-900">Performance</h3>
              </div>
              <div className="text-3xl font-bold mb-2">
                <span className={getScoreColor(analysis.performance.score)}>{analysis.performance.score}/100</span>
              </div>
              <p className="text-sm text-gray-600">Website Performance</p>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SEO Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Search className="h-6 w-6 text-blue-600" />
                SEO Analysis
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-gray-600 font-medium">Title:</span>
                  <span className="text-right max-w-xs truncate">{analysis.seo.title}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600 font-medium">Meta Description:</span>
                  <span className="text-right max-w-xs text-sm">{analysis.seo.metaDescription}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Headings:</span>
                  <span className="font-medium">{analysis.seo.headings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Canonical URL:</span>
                  <span className="text-sm">{analysis.seo.canonicalLink}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Structured Data:</span>
                  <span className="font-medium">{analysis.seo.structuredData}</span>
                </div>
              </div>
            </div>

            {/* Security Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-red-600" />
                Security Analysis
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Protocol:</span>
                  <span className={`font-bold ${analysis.security.https ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis.security.protocol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">HTTPS Enabled:</span>
                  <span className={`font-bold ${analysis.security.https ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis.security.https ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Meta Robots:</span>
                  <span className="font-medium">{analysis.security.metaRobots}</span>
                </div>
              </div>
            </div>

            {/* Accessibility Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-purple-600" />
                Accessibility Analysis
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Alt Text Coverage:</span>
                  <span className={`font-bold ${analysis.accessibility.altTextPercentage >= 80 ? 'text-green-600' : analysis.accessibility.altTextPercentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {analysis.accessibility.altTextPercentage}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Images with Alt Text:</span>
                  <span className="font-medium">{analysis.accessibility.altTextCoverage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Viewport Meta:</span>
                  <span className={`font-bold ${analysis.accessibility.viewportMeta === 'Present' ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis.accessibility.viewportMeta}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Favicon:</span>
                  <span className={`font-bold ${analysis.accessibility.favicon === 'Present' ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis.accessibility.favicon}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="h-6 w-6 text-yellow-600" />
                Performance Analysis
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Content Size:</span>
                  <span className="font-medium">{analysis.performance.contentSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Total Images:</span>
                  <span className="font-medium">{analysis.performance.imageCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Total Links:</span>
                  <span className="font-medium">{analysis.performance.linkCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Word Count:</span>
                  <span className="font-medium">{analysis.performance.wordCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content and Technology */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Content Analysis */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-green-600" />
                Content Overview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Total Words:</span>
                  <span className="font-medium">{analysis.content.wordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Images:</span>
                  <span className="font-medium">{analysis.content.images}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Links:</span>
                  <span className="font-medium">{analysis.content.links}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Forms:</span>
                  <span className="font-medium">{analysis.content.forms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">External Links:</span>
                  <span className="font-medium">{analysis.technology.externalLinks}</span>
                </div>
              </div>
            </div>

            {/* Technology Stack */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="h-6 w-6 text-indigo-600" />
                Technology Stack
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 font-medium">Detected Technologies:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {analysis.technology.detectedTech.split(', ').map((tech, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Structured Data:</span>
                  <span className="font-medium">{analysis.technology.structuredData}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Forms Count:</span>
                  <span className="font-medium">{analysis.technology.forms}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Presence */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Social Media Presence</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(analysis.social).map(([platform, status]) => (
                <div key={platform} className="text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    status === 'Found' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Globe className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium capitalize">{platform}</p>
                  <p className={`text-xs ${status === 'Found' ? 'text-green-600' : 'text-gray-500'}`}>
                    {status}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-blue-600" />
              Recommendations
            </h3>
            <div className="space-y-2">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteBenchmarkTool;