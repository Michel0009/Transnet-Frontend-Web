import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../Api/Api";
import { endpoints } from "../../Api/Endpoints";
import { handleAxiosError } from "../../Utils/ErrorHandler";
import "./TrackingMap.css";
import { toast } from "react-toastify";

const COLORS = {
  primary: "#ff6b00",
  primaryDark: "#e65c00",
  bg: "#f4f7f9",
  white: "#ffffff",
  dark: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
  highlight: "#2563eb",
};

function useMapInit(mapRef, containerRef) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: false }).setView(
      [34.8, 38.5],
      7,
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: "bottomleft" }).addTo(map);
    mapRef.current = map;
    setReady(true);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line
  }, []);
  return ready;
}

function makeTruckIcon(color = COLORS.primary) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
    <circle cx="22" cy="22" r="20" fill="${color}" stroke="#fff" stroke-width="2.5"/>
    <text x="22" y="29" font-size="20" text-anchor="middle" fill="#fff">🚚</text>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -26],
  });
}

function makeEndpointIcon(type) {
  const isStart = type === "start";
  const color = isStart ? "#22c55e" : COLORS.primaryDark;
  const label = isStart ? "أ" : "ب";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42">
    <path d="M17 0C7.611 0 0 7.611 0 17c0 10.5 17 25 17 25S34 27.5 34 17C34 7.611 26.389 0 17 0z" fill="${color}"/>
    <circle cx="17" cy="17" r="9" fill="#fff"/>
    <text x="17" y="21" font-size="10" font-weight="bold" text-anchor="middle" fill="${color}">${label}</text>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -44],
  });
}

function buildDriverCardHTML(d) {
  const updated = d.updated_at
    ? new Date(d.updated_at).toLocaleString("en-US")
    : "—";
  return `
    <div dir="rtl" style="min-width:190px;font-family:inherit;">
      <div style="display:flex;gap:6px;font-size:13px;color:${COLORS.dark};margin-bottom:5px;">
        <span style="font-weight:700;">الاسم:</span>
        <span>${d.first_name ?? ""} ${d.last_name ?? ""}</span>
      </div>
      <div style="display:flex;gap:6px;font-size:13px;color:${COLORS.dark};margin-bottom:5px;">
        <span style="font-weight:700;">الهاتف:</span>
        <span>${d.phone ?? d.phone_number ?? "—"}</span>
      </div>
      <div style="display:flex;gap:6px;font-size:13px;color:${COLORS.dark};">
        <span style="font-weight:700;">آخر تحديث:</span>
        <span dir="ltr">${updated}</span>
      </div>
    </div>
  `;
}

function StatusBadge({ status }) {
  const map = {
    جارية: { bg: "#dbeafe", color: "#2563eb" },
    "قيد التوصيل": { bg: "#fef3c7", color: "#d97706" },
    مستلمة: { bg: "#dcfce7", color: "#16a34a" },
    "غير مستلمة": { bg: "#fee2e2", color: "#dc2626" },
    محظور: { bg: "#fee2e2", color: "#dc2626" },
    متاح: { bg: "#dcfce7", color: "#16a34a" },
    "غير متاح": { bg: "#f3f4f6", color: "#6b7280" },
  };
  const s = map[status] || { bg: COLORS.border, color: COLORS.muted };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        borderRadius: 20,
        padding: "3px 12px",
        fontSize: 12,
        fontWeight: 700,
        display: "inline-block",
      }}
    >
      {status}
    </span>
  );
}

function ShipmentPanel({ data, onClose }) {
  if (!data) return null;
  const { shipment, driver, client, live_tracking } = data;
  return (
    <div className="info-panel slide-in" dir="rtl">
      <div className="panel-header">
        <div>
          <div className="panel-eyebrow">تفاصيل الشحنة</div>
          <div className="panel-title">#{shipment.shipment_number}</div>
        </div>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <StatusBadge status={shipment.status} />

      <div style={{ margin: "4px 0 2px" }}>
        <div className="route-visual">
          <div className="route-dot start" />
          <div className="route-line">
            {live_tracking && <div className="progress-truck">🚚</div>}
          </div>
          <div className="route-dot end" />
        </div>
        <div className="route-labels">
          <span>{shipment.start_governorate}</span>
          <span>{shipment.end_governorate}</span>
        </div>
      </div>

      {live_tracking && (
        <div className="live-badge">
          <span className="pulse-dot" />
          مباشر · {live_tracking.remaining_distance_km} كم ·{" "}
          {live_tracking.remaining_duration_mins} دقيقة متبقية
        </div>
      )}

      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">البضاعة</span>
          <span className="info-value">{shipment.object}</span>
        </div>
        <div className="info-item">
          <span className="info-label">السعر</span>
          <span className="info-value">
            {shipment.price?.toLocaleString()} ل.س
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">الوزن</span>
          <span className="info-value">{shipment.weight} كغ</span>
        </div>
        <div className="info-item">
          <span className="info-label">الطول</span>
          <span className="info-value">{shipment.length}</span>
        </div>
        <div className="info-item">
          <span className="info-label">العرض</span>
          <span className="info-value">{shipment.width}</span>
        </div>
        <div className="info-item">
          <span className="info-label">الارتفاع</span>
          <span className="info-value">{shipment.height}</span>
        </div>
        <div className="info-item">
          <span className="info-label">الدفع</span>
          <span className="info-value">
            {shipment.paid ? "✓ مدفوع" : "✗ غير مدفوع"}
          </span>
        </div>
        <div className="info-item" style={{ gridColumn: "1 / -1" }}>
          <span className="info-label">موعد التسليم</span>
          <span className="info-value" style={{ fontSize: 12 }} dir="ltr">
            {new Date(shipment.delivery_deadline).toLocaleString("en-US")}
          </span>
        </div>
      </div>

      {driver && (
        <div className="person-card">
          <div className="avatar driver-avatar">🧑‍✈️</div>
          <div style={{ flex: 1 }}>
            <div className="person-role">السائق</div>
            <div className="person-name">
              {driver.first_name} {driver.last_name}
            </div>
            <div className="person-phone">{driver.phone_number}</div>
          </div>
          <div className="person-num">#{driver.user_number}</div>
        </div>
      )}

      {client && (
        <div className="person-card">
          <div className="avatar client-avatar">👤</div>
          <div style={{ flex: 1 }}>
            <div className="person-role">العميل</div>
            <div className="person-name">
              {client.first_name} {client.last_name}
            </div>
            <div className="person-phone">{client.phone_number}</div>
          </div>
          <div className="person-num">#{client.user_number}</div>
        </div>
      )}
    </div>
  );
}

function DriverPanel({ data, onClose }) {
  if (!data) return null;
  return (
    <div className="info-panel slide-in" dir="rtl">
      <div className="panel-header">
        <div>
          <div className="panel-eyebrow">معلومات السائق</div>
          <div className="panel-title">
            {data.first_name} {data.last_name}
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="driver-big-avatar">🧑‍✈️</div>

      <div style={{ textAlign: "center", marginTop: -8 }}>
        <StatusBadge status={data.status} />
      </div>

      <div className="info-grid">
        <div className="info-item" style={{ gridColumn: "1 / -1" }}>
          <span className="info-label">رقم الهاتف</span>
          <span className="info-value">{data.phone_number}</span>
        </div>
        <div className="info-item">
          <span className="info-label">نوع المركبة</span>
          <span className="info-value">{data.vehicle_type}</span>
        </div>
        <div className="info-item">
          <span className="info-label">التقييم</span>
          <span className="info-value">
            ⭐ {parseFloat(data.rating).toFixed(1)}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">الحالة</span>
          <span className="info-value">
            {data.availability ? "🟢 متاح" : "🔴 غير متاح"}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">رقم المستخدم</span>
          <span className="info-value">#{data.user_number}</span>
        </div>
      </div>
    </div>
  );
}

export default function TrackingMap() {
  const { shipmentNumber } = useParams();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const routeLayerRef = useRef(null);
  const routeMarkersRef = useRef([]);

  const mapReady = useMapInit(mapRef, containerRef);

  const [drivers, setDrivers] = useState([]);
  const [shipmentPanel, setShipmentPanel] = useState(null);
  const [driverPanel, setDriverPanel] = useState(null);
  const [highlightedDriverId, setHighlightedDriverId] = useState(null);
  const [shipmentQuery, setShipmentQuery] = useState("");
  const [driverQuery, setDriverQuery] = useState("");
  const [shipmentLoading, setShipmentLoading] = useState(false);
  const [driverLoading, setDriverLoading] = useState(false);
  const [liveCount, setLiveCount] = useState(0);

  const fetchDriverLocations = useCallback(async () => {
    try {
      const data = await api.get(endpoints.drivers.getLocation);
      const normalized = (data.data.drivers || []).map((d) => ({
        ...d,
        lat: d.lat !== null && d.lat !== undefined ? parseFloat(d.lat) : null,
        lng: d.lng !== null && d.lng !== undefined ? parseFloat(d.lng) : null,
      }));
      setDrivers(normalized);
    } catch (err) {
      toast.error(handleAxiosError(err));
    }
  }, []);

  useEffect(() => {
    fetchDriverLocations();
  }, [fetchDriverLocations]);

  useEffect(() => {
    if (!mapReady || !shipmentNumber) return;
    if (shipmentPanel?.shipment?.shipment_number === shipmentNumber) return;
    setShipmentQuery(shipmentNumber);
    searchShipment(shipmentNumber);
    // eslint-disable-next-line
  }, [mapReady, shipmentNumber]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
    markersRef.current = {};

    drivers.forEach((d) => {
      if (!d.lat || !d.lng) return;
      const isHighlighted = d.driver_id === highlightedDriverId;
      const marker = L.marker([d.lat, d.lng], {
        icon: makeTruckIcon(isHighlighted ? COLORS.highlight : COLORS.primary),
      })
        .addTo(map)
        .bindPopup(buildDriverCardHTML(d), {
          closeButton: false,
          autoClose: false,
          closeOnClick: false,
          offset: [0, -4],
        });
      markersRef.current[d.driver_id] = marker;
    });

    setLiveCount(drivers.filter((d) => d.lat && d.lng).length);
  }, [mapReady, drivers, highlightedDriverId]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.Echo) return;
    const channel = window.Echo.private("admin-tracking");
    channel.listen(".location.updated", (e) => {
      const lat = parseFloat(e.lat);
      const lng = parseFloat(e.lng);
      const cardInfo = {
        first_name: e.first_name,
        last_name: e.last_name,
        phone_number: e.phone_number,
        updated_at: e.updated_at,
      };

      setDrivers((prev) => {
        const exists = prev.some((d) => d.driver_id === e.driver_id);
        if (exists) {
          return prev.map((d) =>
            d.driver_id === e.driver_id ? { ...d, lat, lng, ...cardInfo } : d,
          );
        }
        return [...prev, { driver_id: e.driver_id, lat, lng, ...cardInfo }];
      });

      if (markersRef.current[e.driver_id]) {
        const marker = markersRef.current[e.driver_id];
        marker.setLatLng([lat, lng]);
        marker.setPopupContent(buildDriverCardHTML(cardInfo));
      } else if (
        mapRef.current &&
        Number.isFinite(lat) &&
        Number.isFinite(lng)
      ) {
        const marker = L.marker([lat, lng], { icon: makeTruckIcon() })
          .addTo(mapRef.current)
          .bindPopup(buildDriverCardHTML(cardInfo), {
            closeButton: false,
            autoClose: false,
            closeOnClick: false,
            offset: [0, -4],
          });
        markersRef.current[e.driver_id] = marker;
      }
    });
    return () => channel.stopListening(".location.updated");
  }, []);

  const searchShipment = async (overrideQuery) => {
    const raw =
      typeof overrideQuery === "string" ? overrideQuery : shipmentQuery;
    const query = raw.trim();
    if (!query) return;
    setShipmentLoading(true);
    setShipmentPanel(null);
    setDriverPanel(null);
    setHighlightedDriverId(null);
    clearRoute();
    try {
      const data = await api.get(`${endpoints.shipments.search(query)}`);
      setShipmentPanel(data.data);
      drawRoute(data.data);
      if (query !== shipmentNumber) {
        window.history.replaceState(null, "", `/dashboard/tracking/${query}`);
      }
    } catch (error) {
      if (error?.response?.data?.message === "هذه الشحنة غير موجودة") {
        toast.error(error.response.data.message);
      } else {
        toast.error(handleAxiosError(error));
      }
    } finally {
      setShipmentLoading(false);
    }
  };

  const drawRoute = (data) => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (routeLayerRef.current) map.removeLayer(routeLayerRef.current);
    routeMarkersRef.current.forEach((m) => map.removeLayer(m));
    routeMarkersRef.current = [];

    const coords = (data.route_geometry?.coordinates || []).map(
      ([lng, lat]) => [lat, lng],
    );
    if (!coords.length) return;

    routeLayerRef.current = L.polyline(coords, {
      color: COLORS.primary,
      weight: 5,
      opacity: 0.85,
      dashArray: data.live_tracking ? "10, 6" : null,
    }).addTo(map);

    const startM = L.marker(coords[0], {
      icon: makeEndpointIcon("start"),
    }).addTo(map);
    const endM = L.marker(coords[coords.length - 1], {
      icon: makeEndpointIcon("end"),
    }).addTo(map);
    routeMarkersRef.current = [startM, endM];
    map.fitBounds(routeLayerRef.current.getBounds(), { padding: [60, 60] });
  };

  const clearRoute = () => {
    if (!mapRef.current) return;
    if (routeLayerRef.current)
      mapRef.current.removeLayer(routeLayerRef.current);
    routeMarkersRef.current.forEach((m) => mapRef.current.removeLayer(m));
    routeMarkersRef.current = [];
  };

  const searchDriver = async () => {
    if (!driverQuery.trim()) return;
    setDriverLoading(true);
    setDriverPanel(null);
    setShipmentPanel(null);
    setHighlightedDriverId(null);
    clearRoute();
    try {
      const data = await api.post(endpoints.drivers.search, {
        driver_number: driverQuery.trim(),
      });

      setDriverPanel(data.data);
      setHighlightedDriverId(data.data.id);
      const found = drivers.find((d) => d.driver_id === data.data.id);
      if (found?.lat && found?.lng && mapRef.current) {
        mapRef.current.setView([found.lat, found.lng], 15, { animate: true });
        markersRef.current[data.data.id]?.openPopup();
      }
    } catch (error) {
      if (error?.response?.data?.message === "لا يوجد سائق بهذا الرقم") {
        toast.error(error.response.data.message);
      } else {
        toast.error(handleAxiosError(error));
      }
    } finally {
      setDriverLoading(false);
    }
  };

  return (
    <div className="tracking-root">
      <div className="toolbar">
        <div className="search-wrap">
          <div className="search-group">
            <button
              className="search-btn"
              onClick={() => searchShipment()}
              disabled={shipmentLoading}
            >
              {shipmentLoading ? <span className="spinner" /> : "بحث"}
            </button>
            <input
              className="search-input"
              placeholder="رقم الشحنة..."
              value={shipmentQuery}
              onChange={(e) => setShipmentQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchShipment()}
            />
            <span className="search-icon">📦</span>
          </div>
        </div>

        <div className="divider-v" />

        <div className="search-wrap">
          <div className="search-group">
            <button
              className="search-btn"
              onClick={searchDriver}
              disabled={driverLoading}
            >
              {driverLoading ? <span className="spinner" /> : "بحث"}
            </button>
            <input
              className="search-input"
              placeholder="رقم المستخدم للسائق..."
              value={driverQuery}
              onChange={(e) => setDriverQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchDriver()}
            />
            <span className="search-icon">🧑‍✈️</span>
          </div>
        </div>

        <div className="live-stat">
          <div className="live-dot" />
          {liveCount} سائق على الخريطة
        </div>
      </div>

      <div className="map-area">
        <div id="map-container" ref={containerRef} />

        {shipmentPanel && (
          <ShipmentPanel
            data={shipmentPanel}
            onClose={() => {
              clearRoute();
              setShipmentPanel(null);
            }}
          />
        )}

        {driverPanel && !shipmentPanel && (
          <DriverPanel
            data={driverPanel}
            onClose={() => {
              setDriverPanel(null);
              setHighlightedDriverId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
