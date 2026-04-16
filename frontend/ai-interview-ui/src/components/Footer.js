import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Github,
  Linkedin,
  Instagram,
  Send,
} from "lucide-react";
import logo from "../assets/Website Logo.png";
import "../styles/Footer.css";

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState(null);
  const supportEmail = "interviewr.ai.support@gmail.com";

  const getSupportComposeUrl = () => {
    let userEmail = "";
    try {
      const rawUser = window.localStorage.getItem("user");
      const parsedUser = rawUser ? JSON.parse(rawUser) : null;
      userEmail = String(parsedUser?.email || "").trim();
    } catch {
      userEmail = "";
    }

    const params = new URLSearchParams({
      view: "cm",
      fs: "1",
      tf: "1",
      to: supportEmail,
      su: "INTERVIEWR Support",
    });

    if (userEmail) {
      params.set("authuser", userEmail);
    }

    return `https://mail.google.com/mail/?${params.toString()}`;
  };
  const members = [
    {
      name: "Member 1",
      links: {
        Facebook: "https://www.facebook.com/share/14ZboXtdp5a/",
        GitHub: "https://github.com/Bhababhanjan1",
        LinkedIn:
          "https://www.linkedin.com/in/bhababhanjan-panda-65b340275?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        Instagram:
          "https://www.instagram.com/bhababhanjanpanda04?utm_source=qr&igsh=MTR5dzhlb3d1a3B0bg%3D%3D",
      },
    },
    {
      name: "Member 2",
      links: {
        Facebook: "https://www.facebook.com/share/1HycJX4VCw/",
        GitHub: "https://github.com/Krushna-Chandra",
        LinkedIn: "https://www.linkedin.com/in/krushna-chandra-bindhani-1b1342275/",
        Instagram:
          "https://www.instagram.com/krushna__chandra_bindhani?igsh=MXNqNG8zeXExeW9sYw==",
      },
    },
    {
      name: "Member 3",
      links: {
        Facebook: "https://www.facebook.com/share/181DgSYxpS/",
        GitHub: "https://github.com/binaykumardas24",
        LinkedIn:
          "https://www.linkedin.com/in/binay-kumar-das-57b9b7275?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        Instagram:
          "https://www.instagram.com/__bi_n_ay_?utm_source=qr&igsh=ODFvczMwcTA2dHVw",
      },
    },
    {
      name: "Member 4",
      links: {
        Facebook: "https://www.facebook.com/share/1HawVsK43g/",
        GitHub: "https://github.com/Sushant542004",
        LinkedIn: "https://www.linkedin.com/in/sushant-dhinda-1b8343275",
        Instagram: "https://www.instagram.com/__sushant.dhinda__/?hl=en",
      },
    },
  ];
  const socialPlatforms = [
    { name: "GitHub", Icon: Github },
    { name: "LinkedIn", Icon: Linkedin },
    { name: "Facebook", Icon: Facebook },
    { name: "Instagram", Icon: Instagram },
  ];

  useEffect(() => {
    const clearFocusedSocialLink = () => {
      if (document.hidden && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };

    document.addEventListener("visibilitychange", clearFocusedSocialLink);

    return () => {
      document.removeEventListener("visibilitychange", clearFocusedSocialLink);
    };
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribeStatus("success");
      setEmail("");
      setTimeout(() => setSubscribeStatus(null), 3000);
    }
  };

  const openSupportGmail = (event) => {
    event.preventDefault();
    const composeUrl = getSupportComposeUrl();
    window.open(composeUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <footer className="footer">
      {/* Newsletter Section */}
      <div className="footer-newsletter">
        <div className="newsletter-content">
          <div className="newsletter-text">
            <h3>Stay Updated</h3>
            <p>Get the latest interview tips and AI insights delivered to your inbox.</p>
          </div>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <div className="newsletter-input-group">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-btn">
                <Send size={18} />
              </button>
            </div>
            {subscribeStatus === "success" && (
              <span className="subscribe-success">✓ Thank you for subscribing!</span>
            )}
          </form>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section footer-brand">
            <Link to="/" className="footer-logo">
              <img src={logo} alt="Interviewr" />
              <span>INTERVIEWR</span>
            </Link>
            <p className="footer-tagline">
              Master your interviews with AI-powered practice and real-time feedback
            </p>
            <div className="footer-social">
              {socialPlatforms.map(({ name, Icon }) => (
                <div className="social-link-group" key={name}>
                  <button type="button" className="social-link" title={name} aria-label={name}>
                    <Icon size={20} />
                  </button>
                  <div className="social-link-row" aria-label={`${name} member links`}>
                    {members.map((member) => (
                      <a
                        key={`${name}-${member.name}`}
                        href={member.links[name]}
                        className="social-link-mini"
                        aria-label={`${member.name} ${name} profile`}
                        title={`${member.name} ${name}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Icon size={14} />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Products Section */}
          <div className="footer-section">
            <h4 className="footer-section-title">Products</h4>
            <ul className="footer-links">
              <li>
                <Link to="/hr-interview">HR Interviews</Link>
              </li>
              <li>
                <Link to="/technical-interview">Technical Interviews</Link>
              </li>
              <li>
                <Link to="/resume-analyzer">Resume Analyzer</Link>
              </li>
              <li>
                <Link to="/mock-interview">Mock Interviews</Link>
              </li>
              <li>
                <Link to="/aptitude-test">Aptitude Tests</Link>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div className="footer-section">
            <h4 className="footer-section-title">Resources</h4>
            <ul className="footer-links">
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/#how-it-works">Interview Guides</Link>
              </li>
              <li>
                <Link to="/#faqs">FAQs</Link>
              </li>
              <li>
                  <button
                    type="button"
                    className="footer-support-trigger"
                    onClick={openSupportGmail}
                  >
                    Contact Support
                  </button>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="footer-section footer-contact">
            <h4 className="footer-section-title">Contact Us</h4>
            <div className="contact-item">
              <Mail size={18} />
              <button
                type="button"
                className="contact-email-button"
                onClick={openSupportGmail}
              >
                {supportEmail}
              </button>
            </div>
            <div className="contact-item">
              <Phone size={18} />
              <a href="tel:+1234567890">+1 (234) 567-890</a>
            </div>
            <div className="contact-item">
              <MapPin size={18} />
              <span>123 Tech Street, San Francisco, CA 94105</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © 2026 Interviewr. All rights reserved. Crafted with precision for your success.
            </p>
            <div className="footer-bottom-links">
              <a href="#privacy">Privacy</a>
              <span className="divider">•</span>
              <a href="#terms">Terms</a>
              <span className="divider">•</span>
              <a href="#cookies">Cookies</a>
              <span className="divider">•</span>
              <a href="#sitemap">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
