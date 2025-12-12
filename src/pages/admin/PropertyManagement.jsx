import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  MapPin,
  Users,
  DollarSign,
  FileText,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import "./PropertyManagement.css";

const PropertyManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [property, setProperty] = useState(null);
  const [unitTypes, setUnitTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Property form state
  const [propertyForm, setPropertyForm] = useState({
    name: "",
    address: "",
    city: "",
    neighborhood: "",
    has_parking: false,
    has_security: false,
    has_borehole: false,
    description: "",
    primary_image_url: "",
    latitude: "",
    longitude: "",
  });

  // Unit type form state
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [unitForm, setUnitForm] = useState({
    name: "",
    category: "",
    price_per_month: "",
    deposit_amount: "",
    agreement_fee: "",
    garbage_fee_monthly: "",
    water_fee_monthly: "",
    internet_fee_monthly: "",
    other_fees: "",
    available_units_count: "",
    description: "",
  });

  // Image management state
  const [unitImages, setUnitImages] = useState([]);
  const [selectedUnitForImages, setSelectedUnitForImages] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Document management state
  const [documents, setDocuments] = useState([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  // Location state
  const [location, setLocation] = useState({
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    if (id) {
      fetchProperty();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await api.get(`/properties/${id}`);
      setProperty(response.data);
      setPropertyForm({
        name: response.data.name || "",
        address: response.data.address || "",
        city: response.data.city || "",
        neighborhood: response.data.neighborhood || "",
        has_parking: response.data.has_parking || false,
        has_security: response.data.has_security || false,
        has_borehole: response.data.has_borehole || false,
        description: response.data.description || "",
        primary_image_url: response.data.primary_image_url || "",
        latitude: response.data.latitude || "",
        longitude: response.data.longitude || "",
      });
      setUnitTypes(response.data.unit_types || []);

      // Fetch documents for this property
      fetchDocuments();
    } catch (error) {
      console.error("Error fetching property:", error);
      toast.error("Failed to load property");
      navigate("/admin/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const saveProperty = async () => {
    try {
      if (id) {
        await api.put(`/properties/${id}`, propertyForm);
        toast.success("Property updated successfully");
      } else {
        const response = await api.post("/properties", propertyForm);
        toast.success("Property created successfully");
        navigate(`/admin/properties/${response.data.id}`);
      }
      fetchProperty();
    } catch (error) {
      console.error("Error saving property:", error);
      toast.error("Failed to save property");
    }
  };

  const deleteProperty = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this property? This action cannot be undone."
      )
    )
      return;
    try {
      await api.delete(`/properties/${id}`);
      toast.success("Property deleted successfully");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property");
    }
  };

  const saveUnitType = async () => {
    try {
      const unitData = {
        ...unitForm,
        property_id: id,
        price_per_month: parseFloat(unitForm.price_per_month) || 0,
        deposit_amount: parseFloat(unitForm.deposit_amount) || 0,
        agreement_fee: parseFloat(unitForm.agreement_fee) || 0,
        garbage_fee_monthly: parseFloat(unitForm.garbage_fee_monthly) || 0,
        water_fee_monthly: parseFloat(unitForm.water_fee_monthly) || 0,
        internet_fee_monthly: parseFloat(unitForm.internet_fee_monthly) || 0,
        other_fees: parseFloat(unitForm.other_fees) || 0,
        available_units_count: parseInt(unitForm.available_units_count) || 0,
      };

      if (editingUnit) {
        await api.put(`/unit-types/${editingUnit.id}`, unitData);
        toast.success("Unit type updated successfully");
      } else {
        await api.post("/unit-types", unitData);
        toast.success("Unit type created successfully");
      }
      setShowUnitModal(false);
      resetUnitForm();
      fetchProperty();
    } catch (error) {
      console.error("Error saving unit type:", error);
      toast.error("Failed to save unit type");
    }
  };

  const deleteUnitType = async (unitId) => {
    if (!window.confirm("Are you sure you want to delete this unit type?"))
      return;
    try {
      await api.delete(`/unit-types/${unitId}`);
      toast.success("Unit type deleted successfully");
      fetchProperty();
    } catch (error) {
      console.error("Error deleting unit type:", error);
      toast.error("Failed to delete unit type");
    }
  };

  const resetUnitForm = () => {
    setUnitForm({
      name: "",
      category: "",
      price_per_month: "",
      deposit_amount: "",
      agreement_fee: "",
      garbage_fee_monthly: "",
      water_fee_monthly: "",
      internet_fee_monthly: "",
      other_fees: "",
      available_units_count: "",
      description: "",
    });
    setEditingUnit(null);
  };

  const openUnitModal = (unit = null) => {
    if (unit) {
      setEditingUnit(unit);
      setUnitForm({
        name: unit.name || "",
        category: unit.category || "",
        price_per_month: unit.price_per_month || "",
        deposit_amount: unit.deposit_amount || "",
        agreement_fee: unit.agreement_fee || "",
        garbage_fee_monthly: unit.garbage_fee_monthly || "",
        water_fee_monthly: unit.water_fee_monthly || "",
        internet_fee_monthly: unit.internet_fee_monthly || "",
        other_fees: unit.other_fees || "",
        available_units_count: unit.available_units_count || "",
        description: unit.description || "",
      });
    } else {
      resetUnitForm();
    }
    setShowUnitModal(true);
  };

  const handleImageUpload = async (file) => {
    if (!file) return "";
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Image uploaded successfully");
      return res.data.url;
    } catch (error) {
      toast.error("Failed to upload image");
      return "";
    } finally {
      setUploadingImage(false);
    }
  };

  const addUnitImage = async (unitId, imageUrl, isPrimary = false) => {
    try {
      await api.post("/unit-images", {
        unit_type_id: unitId,
        image_url: imageUrl,
        is_primary: isPrimary,
      });
      toast.success("Image added to unit");
      fetchProperty();
    } catch (error) {
      console.error("Error adding image:", error);
      toast.error("Failed to add image");
    }
  };

  const deleteUnitImage = async (imageId) => {
    try {
      await api.delete(`/unit-images/${imageId}`);
      toast.success("Image deleted");
      fetchProperty();
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const setPrimaryImage = async (imageId) => {
    try {
      await api.put(`/unit-images/${imageId}/primary`);
      toast.success("Primary image updated");
      fetchProperty();
    } catch (error) {
      console.error("Error setting primary image:", error);
      toast.error("Failed to set primary image");
    }
  };

  const fetchDocuments = async () => {
    try {
      // Fetch documents for all unit types in this property
      const allDocuments = [];
      for (const unit of unitTypes) {
        const response = await api.get(`/documents?unit_type_id=${unit.id}`);
        allDocuments.push(
          ...response.data.map((doc) => ({ ...doc, unit_name: unit.name }))
        );
      }
      setDocuments(allDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleDocumentUpload = async (file) => {
    if (!file) return "";
    setUploadingDocument(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Document uploaded successfully");
      return res.data.url;
    } catch (error) {
      toast.error("Failed to upload document");
      return "";
    } finally {
      setUploadingDocument(false);
    }
  };

  const addDocument = async (title, fileUrl, unitTypeId) => {
    try {
      await api.post("/documents", {
        unit_type_id: unitTypeId,
        title,
        file_url: fileUrl,
        doc_type: "agreement",
      });
      toast.success("Document added");
      fetchDocuments();
    } catch (error) {
      console.error("Error adding document:", error);
      toast.error("Failed to add document");
    }
  };

  const deleteDocument = async (documentId) => {
    try {
      await api.delete(`/documents/${documentId}`);
      toast.success("Document deleted");
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="property-management">
      <div className="property-management-container">
        {/* Header */}
        <div className="property-management-header">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="back-button"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="header-content">
            <h1 className="page-title">
              {id ? "Edit Property" : "Create New Property"}
            </h1>
            <p className="page-subtitle">
              {id
                ? "Manage property details and unit types"
                : "Add a new property to your portfolio"}
            </p>
          </div>
          {id && (
            <button onClick={deleteProperty} className="delete-button">
              <Trash2 size={16} />
              Delete Property
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="property-tabs">
          <button
            className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <Settings size={18} />
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === "units" ? "active" : ""}`}
            onClick={() => setActiveTab("units")}
          >
            <Users size={18} />
            Unit Types
          </button>
          <button
            className={`tab-button ${activeTab === "images" ? "active" : ""}`}
            onClick={() => setActiveTab("images")}
          >
            <ImageIcon size={18} />
            Images
          </button>
          <button
            className={`tab-button ${
              activeTab === "documents" ? "active" : ""
            }`}
            onClick={() => setActiveTab("documents")}
          >
            <FileText size={18} />
            Documents
          </button>
          <button
            className={`tab-button ${activeTab === "location" ? "active" : ""}`}
            onClick={() => setActiveTab("location")}
          >
            <MapPin size={18} />
            Location
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "overview" && (
            <div className="overview-section">
              <div className="form-section">
                <h3>Property Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Property Name *</label>
                    <input
                      type="text"
                      value={propertyForm.name}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter property name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Address *</label>
                    <input
                      type="text"
                      value={propertyForm.address}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          address: e.target.value,
                        })
                      }
                      placeholder="Enter full address"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      value={propertyForm.city}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          city: e.target.value,
                        })
                      }
                      placeholder="Enter city"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Neighborhood</label>
                    <input
                      type="text"
                      value={propertyForm.neighborhood}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          neighborhood: e.target.value,
                        })
                      }
                      placeholder="Enter neighborhood"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={propertyForm.description}
                    onChange={(e) =>
                      setPropertyForm({
                        ...propertyForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter property description"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>Property Overview Image</label>
                  <div className="image-upload-section">
                    {propertyForm.primary_image_url && (
                      <div className="current-image">
                        <img
                          src={propertyForm.primary_image_url}
                          alt="Property overview"
                          style={{
                            width: "200px",
                            height: "150px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPropertyForm({
                              ...propertyForm,
                              primary_image_url: "",
                            })
                          }
                          className="remove-image-button"
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                    <div className="upload-controls">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const url = await handleImageUpload(file);
                            if (url) {
                              setPropertyForm({
                                ...propertyForm,
                                primary_image_url: url,
                              });
                            }
                          }
                        }}
                        style={{ display: "none" }}
                        id="property-image-upload"
                      />
                      <label
                        htmlFor="property-image-upload"
                        className="upload-button"
                      >
                        <Upload size={16} />
                        {propertyForm.primary_image_url
                          ? "Change Image"
                          : "Upload Overview Image"}
                      </label>
                      <p className="upload-help">
                        This image will be displayed on property cards and
                        listings
                      </p>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Property Features</label>
                  <div className="checkbox-grid">
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={propertyForm.has_parking}
                        onChange={(e) =>
                          setPropertyForm({
                            ...propertyForm,
                            has_parking: e.target.checked,
                          })
                        }
                      />
                      <span>Parking Available</span>
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={propertyForm.has_security}
                        onChange={(e) =>
                          setPropertyForm({
                            ...propertyForm,
                            has_security: e.target.checked,
                          })
                        }
                      />
                      <span>24/7 Security</span>
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={propertyForm.has_borehole}
                        onChange={(e) =>
                          setPropertyForm({
                            ...propertyForm,
                            has_borehole: e.target.checked,
                          })
                        }
                      />
                      <span>Borehole Water</span>
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button onClick={saveProperty} className="save-button">
                    <Save size={16} />
                    {id ? "Update Property" : "Create Property"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "units" && (
            <div className="units-section">
              <div className="section-header">
                <h3>Unit Types</h3>
                <button onClick={() => openUnitModal()} className="add-button">
                  <Plus size={16} />
                  Add Unit Type
                </button>
              </div>

              <div className="units-grid">
                {unitTypes.map((unit) => (
                  <div key={unit.id} className="unit-card">
                    <div className="unit-header">
                      <h4>{unit.name}</h4>
                      <div className="unit-actions">
                        <button
                          onClick={() => openUnitModal(unit)}
                          className="edit-button"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => deleteUnitType(unit.id)}
                          className="delete-button"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="unit-details">
                      <div className="unit-detail">
                        <DollarSign size={14} />
                        <span>
                          KES {unit.price_per_month?.toLocaleString()}/month
                        </span>
                      </div>
                      <div className="unit-detail">
                        <Users size={14} />
                        <span>{unit.available_units_count} available</span>
                      </div>
                      <div className="unit-detail">
                        <FileText size={14} />
                        <span>{unit.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "images" && (
            <div className="images-section">
              <div className="section-header">
                <h3>Unit Images</h3>
                <p>Manage images for each unit type</p>
              </div>

              <div className="units-images-grid">
                {unitTypes.map((unit) => (
                  <div key={unit.id} className="unit-images-card">
                    <div className="unit-images-header">
                      <h4>{unit.name}</h4>
                      <button
                        onClick={() =>
                          setSelectedUnitForImages(
                            selectedUnitForImages === unit.id ? null : unit.id
                          )
                        }
                        className="toggle-images-button"
                      >
                        {selectedUnitForImages === unit.id ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>

                    {selectedUnitForImages === unit.id && (
                      <div className="unit-images-content">
                        <div className="images-grid">
                          {unit.images?.map((image) => (
                            <div key={image.id} className="image-item">
                              <img
                                src={image.image_url}
                                alt={`${unit.name} image`}
                              />
                              <div className="image-actions">
                                <button
                                  onClick={() => setPrimaryImage(image.id)}
                                  className={`primary-button ${
                                    image.is_primary ? "active" : ""
                                  }`}
                                >
                                  {image.is_primary ? "Primary" : "Set Primary"}
                                </button>
                                <button
                                  onClick={() => deleteUnitImage(image.id)}
                                  className="delete-image-button"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                          <div className="upload-image-item">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const url = await handleImageUpload(file);
                                  if (url) {
                                    await addUnitImage(
                                      unit.id,
                                      url,
                                      !unit.images?.length
                                    );
                                  }
                                }
                              }}
                              style={{ display: "none" }}
                              id={`upload-${unit.id}`}
                            />
                            <label
                              htmlFor={`upload-${unit.id}`}
                              className="upload-button"
                            >
                              <Upload size={24} />
                              <span>Add Image</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="documents-section">
              <div className="section-header">
                <h3>Unit Documents</h3>
                <p>Manage PDF documents for each unit type</p>
              </div>

              <div className="units-documents-grid">
                {unitTypes.map((unit) => (
                  <div key={unit.id} className="unit-documents-card">
                    <div className="unit-documents-header">
                      <h4>{unit.name}</h4>
                      <button
                        onClick={() =>
                          setSelectedUnitForImages(
                            selectedUnitForImages === unit.id ? null : unit.id
                          )
                        }
                        className="toggle-documents-button"
                      >
                        {selectedUnitForImages === unit.id ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>

                    {selectedUnitForImages === unit.id && (
                      <div className="unit-documents-content">
                        <div className="documents-grid">
                          {documents
                            .filter((doc) => doc.unit_type_id === unit.id)
                            .map((doc) => (
                              <div key={doc.id} className="document-item">
                                <div className="document-info">
                                  <FileText size={20} />
                                  <div>
                                    <h4>{doc.title}</h4>
                                    <p>{doc.doc_type}</p>
                                  </div>
                                </div>
                                <div className="document-actions">
                                  <button
                                    onClick={() =>
                                      window.open(doc.file_url, "_blank")
                                    }
                                    className="download-button"
                                  >
                                    Download
                                  </button>
                                  <button
                                    onClick={() => deleteDocument(doc.id)}
                                    className="delete-button"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          <div className="upload-document-item">
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const url = await handleDocumentUpload(file);
                                  if (url) {
                                    const title = prompt(
                                      "Enter document title:"
                                    );
                                    if (title) {
                                      await addDocument(title, url, unit.id);
                                    }
                                  }
                                }
                              }}
                              style={{ display: "none" }}
                              id={`document-upload-${unit.id}`}
                            />
                            <label
                              htmlFor={`document-upload-${unit.id}`}
                              className="upload-button"
                            >
                              <Upload size={24} />
                              <span>Add Document</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "location" && (
            <div className="location-section">
              <div className="section-header">
                <h3>Property Location</h3>
                <p>
                  Set the exact location of the property for better navigation
                </p>
              </div>

              <div className="location-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={propertyForm.latitude}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          latitude: e.target.value,
                        })
                      }
                      placeholder="-1.2864"
                    />
                  </div>
                  <div className="form-group">
                    <label>Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={propertyForm.longitude}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          longitude: e.target.value,
                        })
                      }
                      placeholder="36.8172"
                    />
                  </div>
                </div>

                <div className="map-placeholder">
                  <p>Map integration will be added here using Mapbox</p>
                  <p>
                    Current coordinates: {propertyForm.latitude || "Not set"},{" "}
                    {propertyForm.longitude || "Not set"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unit Type Modal */}
      {showUnitModal && (
        <div className="modal-overlay" onClick={() => setShowUnitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUnit ? "Edit Unit Type" : "Add New Unit Type"}</h3>
              <button
                className="modal-close"
                onClick={() => setShowUnitModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Unit Name *</label>
                  <input
                    type="text"
                    value={unitForm.name}
                    onChange={(e) =>
                      setUnitForm({ ...unitForm, name: e.target.value })
                    }
                    placeholder="e.g., 2 Bedroom Apartment"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={unitForm.category}
                    onChange={(e) =>
                      setUnitForm({ ...unitForm, category: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="bedsitter">Bedsitter</option>
                    <option value="single_room">Single Room</option>
                    <option value="one_bedroom">1 Bedroom</option>
                    <option value="two_bedroom">2 Bedroom</option>
                    <option value="three_bedroom">3 Bedroom</option>
                    <option value="four_bedroom_plus">4+ Bedroom</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Monthly Rent (KES) *</label>
                  <input
                    type="number"
                    value={unitForm.price_per_month}
                    onChange={(e) =>
                      setUnitForm({
                        ...unitForm,
                        price_per_month: e.target.value,
                      })
                    }
                    placeholder="25000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Security Deposit (KES)</label>
                  <input
                    type="number"
                    value={unitForm.deposit_amount}
                    onChange={(e) =>
                      setUnitForm({
                        ...unitForm,
                        deposit_amount: e.target.value,
                      })
                    }
                    placeholder="25000"
                  />
                </div>
                <div className="form-group">
                  <label>Agreement Fee (KES)</label>
                  <input
                    type="number"
                    value={unitForm.agreement_fee}
                    onChange={(e) =>
                      setUnitForm({
                        ...unitForm,
                        agreement_fee: e.target.value,
                      })
                    }
                    placeholder="2000"
                  />
                </div>
                <div className="form-group">
                  <label>Available Units *</label>
                  <input
                    type="number"
                    value={unitForm.available_units_count}
                    onChange={(e) =>
                      setUnitForm({
                        ...unitForm,
                        available_units_count: e.target.value,
                      })
                    }
                    placeholder="5"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Garbage Fee (Monthly)</label>
                  <input
                    type="number"
                    value={unitForm.garbage_fee_monthly}
                    onChange={(e) =>
                      setUnitForm({
                        ...unitForm,
                        garbage_fee_monthly: e.target.value,
                      })
                    }
                    placeholder="500"
                  />
                </div>
                <div className="form-group">
                  <label>Water Fee (Monthly)</label>
                  <input
                    type="number"
                    value={unitForm.water_fee_monthly}
                    onChange={(e) =>
                      setUnitForm({
                        ...unitForm,
                        water_fee_monthly: e.target.value,
                      })
                    }
                    placeholder="1000"
                  />
                </div>
                <div className="form-group">
                  <label>Internet Fee (Monthly)</label>
                  <input
                    type="number"
                    value={unitForm.internet_fee_monthly}
                    onChange={(e) =>
                      setUnitForm({
                        ...unitForm,
                        internet_fee_monthly: e.target.value,
                      })
                    }
                    placeholder="2000"
                  />
                </div>
                <div className="form-group">
                  <label>Other Fees (Monthly)</label>
                  <input
                    type="number"
                    value={unitForm.other_fees}
                    onChange={(e) =>
                      setUnitForm({ ...unitForm, other_fees: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={unitForm.description}
                    onChange={(e) =>
                      setUnitForm({ ...unitForm, description: e.target.value })
                    }
                    placeholder="Describe the unit features..."
                    rows="3"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => setShowUnitModal(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button onClick={saveUnitType} className="save-button">
                  <Save size={16} />
                  {editingUnit ? "Update Unit" : "Create Unit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;
