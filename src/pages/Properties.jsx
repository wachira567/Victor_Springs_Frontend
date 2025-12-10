import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import styles from "./Properties.module.css";

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoc, setFilterLoc] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch real data from Python
    const fetchData = async () => {
      try {
        const res = await api.get("/properties");
        setProperties(res.data);
      } catch (err) {
        console.error("Failed to fetch houses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Simple Frontend Filtering
  const filteredProps = properties.filter(
    (p) =>
      filterLoc === "All" ||
      p.city.includes(filterLoc) ||
      p.neighborhood.includes(filterLoc)
  );

  if (loading)
    return (
      <div className={styles.loading}>Loading Victor Springs Inventory...</div>
    );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Available Units</h1>
        <div className={styles.filters}>
          <select
            onChange={(e) => setFilterLoc(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="All">All Locations</option>
            <option value="Ruaka">Ruaka</option>
            <option value="Westlands">Westlands</option>
            <option value="Kileleshwa">Kileleshwa</option>
          </select>
          {/* Add more filters here later */}
        </div>
      </header>

      <div className={styles.grid}>
        {filteredProps.map((property) =>
          // We map through Properties, then map through their Unit Types
          property.unit_types.map((unit) => (
            <div
              key={unit.id}
              className={styles.card}
              onClick={() =>
                navigate(`/properties/${property.id}?unit=${unit.id}`)
              }
            >
              <div className={styles.availabilityBadge}>
                {unit.available_units_count > 0 ? "Available" : "Waitlist Only"}
              </div>

              <div className={styles.imgWrapper}>
                <img
                  src={
                    unit.images[0]?.image_url ||
                    "https://via.placeholder.com/400x300"
                  }
                  alt={unit.name}
                />
              </div>

              <div className={styles.info}>
                <span className={styles.price}>
                  KES {Number(unit.price_per_month).toLocaleString()}
                </span>
                <div className={styles.title}>
                  {unit.name} at {property.name}
                </div>

                <div className={styles.meta}>
                  <span>{unit.category.replace("_", " ")}</span>
                  <span>•</span>
                  <span>{property.neighborhood}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Properties;
