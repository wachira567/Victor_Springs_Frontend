import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  ArrowRight,
  Shield,
  Star,
  Home as HomeIcon,
  Key,
  Coffee,
  Wifi,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import styles from "./Home.module.css"; // We will create this next

// --- Data Configuration ---
const categories = [
  {
    name: "Modern 1 Bedroom",
    icon: HomeIcon,
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Spacious 2 Bedroom",
    icon: Key,
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Studio / Bedsitter",
    icon: Coffee,
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Penthouse Suites",
    icon: Wifi,
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
  },
];

// --- Animations ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredUnits, setFeaturedUnits] = useState([]);
  const navigate = useNavigate();

  // Fetch Listings (Simulated for now, connected to backend later)
  useEffect(() => {
    // Fallback Data for Visual Testing
    setFeaturedUnits([
      {
        id: 1,
        name: "Victor Heights - Unit A4",
        location: "Ruaka, Nairobi",
        price: 25000,
        type: "2 Bedroom",
        image:
          "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=800&q=80",
        tags: ["Balcony", "Borehole"],
      },
      {
        id: 2,
        name: "Sunrise Villas - Penthouse",
        location: "Westlands, Nairobi",
        price: 85000,
        type: "3 Bedroom",
        image:
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
        tags: ["Pool", "Gym", "Security"],
      },
      {
        id: 3,
        name: "The Hub Studios",
        location: "Kileleshwa, Nairobi",
        price: 18000,
        type: "Studio",
        image:
          "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80",
        tags: ["WiFi", "Parking"],
      },
    ]);
  }, []);

  return (
    <div className={styles.container}>
      {/* --- HERO SECTION --- */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <img
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa00c00?auto=format&fit=crop&w=2000&q=80"
            alt="Apartment"
          />
          <div className={styles.heroOverlay}></div>
        </div>

        <div className={styles.heroContent}>
          <motion.span
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className={styles.badge}
          >
            Victor Springs Management
          </motion.span>

          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            Living spaces that <br />
            <span className={styles.gradientText}>respect your lifestyle.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            Premium rentals in Nairobi. Verified listings. Transparent leases.{" "}
            <br />
            No viewing fees for registered users.
          </motion.p>

          <motion.div
            className={styles.searchBox}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Search by location (e.g. Ruaka, Westlands)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => navigate("/properties")}>Search</button>
          </motion.div>
        </div>
      </section>

      {/* --- CATEGORIES --- */}
      <section className={styles.section}>
        <div className={styles.header}>
          <h2>Browse by Type</h2>
          <p>Find the configuration that suits your needs.</p>
        </div>

        <div className={styles.categoryGrid}>
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              className={styles.categoryCard}
              whileHover={{ y: -5 }}
            >
              <img src={cat.image} alt={cat.name} />
              <div className={styles.catOverlay}>
                <cat.icon size={24} />
                <span>{cat.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- FEATURED UNITS --- */}
      <section className={`${styles.section} ${styles.bgLight}`}>
        <div className={styles.headerRow}>
          <div>
            <h2>Available Now</h2>
            <p>Units ready for immediate occupation.</p>
          </div>
          <button
            className={styles.linkBtn}
            onClick={() => navigate("/properties")}
          >
            View All <ArrowRight size={16} />
          </button>
        </div>

        <motion.div
          className={styles.listingGrid}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {featuredUnits.map((unit) => (
            <motion.div
              key={unit.id}
              variants={fadeInUp}
              className={styles.listingCard}
            >
              <div className={styles.cardImage}>
                <img src={unit.image} alt={unit.name} />
                <div className={styles.priceTag}>
                  KES {unit.price.toLocaleString()}
                </div>
              </div>
              <div className={styles.cardContent}>
                <h3>{unit.name}</h3>
                <div className={styles.location}>
                  <MapPin size={16} /> {unit.location}
                </div>
                <div className={styles.tags}>
                  {unit.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <button className={styles.bookBtn}>Book Viewing</button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* --- THE VICTOR SPRINGS STANDARD (Why Us) --- */}
      <section className={styles.section}>
        <div className={styles.standardGrid}>
          <div className={styles.standardText}>
            <h2>The Victor Springs Standard.</h2>
            <p>
              We don't just manage buildings; we manage trust. Here is why
              Nairobi tenants prefer us.
            </p>

            <ul>
              <li>
                <CheckCircle size={20} /> <span>No Hidden Agency Fees</span>
              </li>
              <li>
                <CheckCircle size={20} />{" "}
                <span>Water & Security Guaranteed</span>
              </li>
              <li>
                <CheckCircle size={20} /> <span>Digital Lease Agreements</span>
              </li>
              <li>
                <CheckCircle size={20} /> <span>24/7 Maintenance Support</span>
              </li>
            </ul>
          </div>
          <div className={styles.standardVisual}>
            <div className={styles.glassCard}>
              <Shield size={40} className={styles.accentIcon} />
              <h3>Verified Integrity</h3>
              <p>
                Every listing on this site is managed directly by us. No
                middlemen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>Ready to move in?</h2>
          <p>
            Create a guest account to book viewings and download lease drafts.
          </p>
          <div className={styles.ctaBtns}>
            <button
              className={styles.primaryBtn}
              onClick={() => navigate("/properties")}
            >
              Browse Units
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
