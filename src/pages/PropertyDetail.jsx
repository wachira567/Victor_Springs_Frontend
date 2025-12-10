import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import styles from './PropertyDetail.module.css';
import { MapPin, Check, Wifi, Shield, Car } from 'lucide-react';

const PropertyDetail = () => {
  const { id } = useParams(); // Property ID
  const [searchParams] = useSearchParams();
  const unitId = searchParams.get('unit'); // Unit Type ID

  const [property, setProperty] = useState(null);
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone_number: '',
    appointment_date: '', message: ''
  });
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle, submitting, success, error

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/properties/${id}`);
        setProperty(res.data);
        // Find the specific unit type user clicked on
        const foundUnit = res.data.unit_types.find(u => u.id === parseInt(unitId));
        setUnit(foundUnit || res.data.unit_types[0]); // Fallback to first unit
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, unitId]);

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingStatus('submitting');
    try {
      // Send to Python Backend
      await api.post('/book-viewing', {
        ...formData,
        unit_type_id: unit.id,
        // Convert local date-time string to ISO
        appointment_date: new Date(formData.appointment_date).toISOString()
      });
      setBookingStatus('success');
    } catch (err) {
      console.error(err);
      setBookingStatus('error');
    }
  };

  if (loading || !unit) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      {/* 1. GALLERY */}
      <div className={styles.gallery}>
        <img src={unit.images[0]?.image_url} className={styles.mainImg} alt="Main" />
        <img src={unit.images[1]?.image_url || unit.images[0]?.image_url} className={styles.subImg} alt="Sub" />
      </div>

      <div className={styles.content}>
        {/* 2. LEFT: DETAILS */}
        <div className={styles.details}>
          <h1>{unit.name}</h1>
          <div className={styles.location}>
            <MapPin size={18} /> {property.address}, {property.city}
          </div>

          <p className={styles.description}>{unit.description}</p>

          <h3>Amenities</h3>
          <div className={styles.features}>
            {property.has_parking && <div className={styles.featureItem}><Car size={18}/> Parking Available</div>}
            {property.has_security && <div className={styles.featureItem}><Shield size={18}/> 24/7 Security</div>}
            {property.has_borehole && <div className={styles.featureItem}><Check size={18}/> Borehole Water</div>}
            <div className={styles.featureItem}><Wifi size={18}/> Fiber Ready</div>
          </div>
        </div>

        {/* 3. RIGHT: BOOKING FORM */}
        <div className={styles.sidebar}>
          {bookingStatus === 'success' ? (
            <div className={styles.successMsg}>
              <h3>Request Sent!</h3>
              <p>We have received your request. We will SMS you shortly to confirm the slot.</p>
            </div>
          ) : (
            <form onSubmit={handleBook}>
              <h3>Book a Viewing</h3>
              <div className={styles.formGroup}>
                <label>First Name</label>
                <input required className={styles.input} onChange={e => setFormData({...formData, first_name: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>Last Name</label>
                <input required className={styles.input} onChange={e => setFormData({...formData, last_name: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>Phone (M-Pesa)</label>
                <input required className={styles.input} placeholder="07..." onChange={e => setFormData({...formData, phone_number: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input type="email" required className={styles.input} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>Preferred Date & Time</label>
                <input type="datetime-local" required className={styles.input} onChange={e => setFormData({...formData, appointment_date: e.target.value})} />
              </div>

              <button disabled={bookingStatus === 'submitting'} type="submit" className={styles.submitBtn}>
                {bookingStatus === 'submitting' ? 'Sending...' : 'Request Visit'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;