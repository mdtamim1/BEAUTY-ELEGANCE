import { Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useStorefrontConfig } from '../store/storefrontConfig';
import { replaceContactInfo, formatPageContent } from '../utils/storefrontUtils';

export default function TermsOfService() {
  const [config] = useStorefrontConfig();

  // Find the terms of service link from all footer columns or navLinks
  const allLinks = [
    ...config.navLinks,
    ...config.footerColumns.flatMap(col => col.links),
  ];
  
  // Find link by label or target ID (ID 14 is default for Terms of Service)
  const termsLink = allLinks.find(
    link => {
      const labelLower = (link.label || '').toLowerCase();
      return labelLower === 'terms of service' || labelLower === 'terms and service' || link.id === 14;
    }
  );

  const rawContent = termsLink?.customPageContent || '';
  const formattedHtml = formatPageContent(replaceContactInfo(rawContent, config.contactInfo));

  return (
    <div className="collection-page custom-page">
      {/* Breadcrumb */}
      <nav className="collection-breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <span>Terms of Service</span>
      </nav>

      {/* Main Content Area */}
      <div className="custom-page-wrapper">
        <div className="custom-page-header">
          <h1 className="custom-page-title">Terms of Service</h1>
        </div>
        
        <div className="custom-page-content-card">
          {formattedHtml ? (
            <div 
              className="custom-page-rich-content"
              dangerouslySetInnerHTML={{ __html: formattedHtml }} 
            />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--sf-text-tertiary)', padding: '24px 0' }}>
              <p>No Terms of Service content configured yet.</p>
            </div>
          )}
        </div>

        <div className="custom-page-back-button">
          <Link to="/" className="store-btn store-btn-outline">
            <ArrowLeft size={16} /> Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
