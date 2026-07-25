import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Gauge, Phone, Globe, Image as ImageIcon, Download, RotateCcw, Camera, X, Trash2, Fuel } from 'lucide-react';
import './index.css';

// Custom V-Engine Pistons with Gear Icon (Çift Piston & Dişli Tork İkonu)
const VPistonGearIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 500 500" fill="currentColor">
    {/* Gear Teeth at Bottom */}
    <path d="M250 320 m-95 0 a95 95 0 1 0 190 0 a95 95 0 1 0 -190 0" fill="none" stroke="currentColor" strokeWidth="32" strokeDasharray="32 18" />
    <circle cx="250" cy="320" r="55" fill="none" stroke="currentColor" strokeWidth="24" />
    <circle cx="250" cy="320" r="22" fill="none" stroke="currentColor" strokeWidth="18" />
    
    {/* Left Piston Assembly */}
    <g transform="rotate(-32 250 320)">
      <rect x="200" y="70" width="100" height="105" rx="14" />
      <line x1="200" y1="96" x2="300" y2="96" stroke="var(--bg-dark, #121212)" strokeWidth="8" />
      <circle cx="250" cy="132" r="16" fill="var(--bg-dark, #121212)" />
      <circle cx="250" cy="132" r="8" fill="currentColor" />
      <rect x="230" y="175" width="40" height="120" rx="8" />
    </g>

    {/* Right Piston Assembly */}
    <g transform="rotate(32 250 320)">
      <rect x="200" y="70" width="100" height="105" rx="14" />
      <line x1="200" y1="96" x2="300" y2="96" stroke="var(--bg-dark, #121212)" strokeWidth="8" />
      <circle cx="250" cy="132" r="16" fill="var(--bg-dark, #121212)" />
      <circle cx="250" cy="132" r="8" fill="currentColor" />
      <rect x="230" y="175" width="40" height="120" rx="8" />
    </g>
  </svg>
);

// Custom Material Symbols Chevron SVG Icon (Google Material Ok)
const MaterialChevronIcon = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.6 12L8.7 8.1q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.6 4.6q.15.15.213.325t.062.375t-.062.375t-.213.325l-4.6 4.6q-.275.275-.7.275t-.7-.275t-.275-.7z" />
  </svg>
);

// Fixed Static Data
const PHONE = '0543 966 7245';
const WEBSITE = 'soma.ecupro.com';

function App() {
  const [image, setImage] = useState(null);
  const [format, setFormat] = useState('post'); // 'post' or 'story'
  const [layoutStyle, setLayoutStyle] = useState('standard'); // Standard layout
  const exportRef = useRef(null);

  // Live Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Form State
  const [mainTitle1, setMainTitle1] = useState('Tofaş');
  const [mainTitle2, setMainTitle2] = useState('Doğan');
  const [subtitle, setSubtitle] = useState('Stage Performans Yazılımı');
  const [fuelSavings, setFuelSavings] = useState('');
  const [hpBefore, setHpBefore] = useState('80');
  const [hpAfter, setHpAfter] = useState('170');
  const [torqueBefore, setTorqueBefore] = useState('130');
  const [torqueAfter, setTorqueAfter] = useState('320');

  const clearStats = () => {
    setHpBefore('');
    setHpAfter('');
    setTorqueBefore('');
    setTorqueAfter('');
  };

  // Drag and Zoom State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initPosX: 0, initPosY: 0 });

  // Camera Management
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } } // Prefer back camera on mobile
      });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err) {
      console.error('Kamera erişim hatası:', err);
      alert('Kameraya erişilemedi. Lütfen tarayıcı kamera izinlerinizi kontrol edin.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setImage(dataUrl);
    setPosition({ x: 0, y: 0 });
    setZoom(1);
    stopCamera();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCamera();
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setImage(dataUrl);
        setPosition({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag Handlers
  const handlePointerDown = (e) => {
    if (!image || isCameraActive) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initPosX: position.x,
      initPosY: position.y
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging || isCameraActive) return;
    const deltaX = (e.clientX - dragStartRef.current.x) / zoom;
    const deltaY = (e.clientY - dragStartRef.current.y) / zoom;
    setPosition({
      x: dragStartRef.current.initPosX + deltaX,
      y: dragStartRef.current.initPosY + deltaY
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleResetImage = () => {
    setPosition({ x: 0, y: 0 });
    setZoom(1);
  };

  // Download Handler (Mobile & Desktop HD Export Fix)
  const handleDownload = async () => {
    if (!exportRef.current) return;
    if (isCameraActive) {
      alert('Lütfen önce fotoğrafı çekin veya kamerayı kapatın.');
      return;
    }
    try {
      const node = exportRef.current;
      const targetWidth = node.offsetWidth;
      const targetHeight = node.offsetHeight;

      const options = {
        width: targetWidth,
        height: targetHeight,
        style: {
          width: `${targetWidth}px`,
          height: `${targetHeight}px`,
          margin: '0',
          transform: 'none',
        },
        pixelRatio: 2,
      };

      // Pass 1: Warm up html-to-image font/image cache
      await toPng(node, options);

      // Pass 2: Render crisp high-definition PNG data URL
      const dataUrl = await toPng(node, options);

      // Convert Data URL to Blob for seamless iOS Safari and Android Mobile downloads
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const fileName = `ECUPro_${mainTitle1}_${mainTitle2}_${format}.png`.replace(/\s+/g, '_');

      const link = document.createElement('a');
      link.download = fileName;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 5000);
    } catch (err) {
      console.error('Görsel indirme hatası:', err);
      alert('Görsel oluşturulurken bir hata oluştu: ' + (err?.message || err));
    }
  };

  // Check if HP/Torque should be shown
  const showHp = Boolean(hpBefore || hpAfter);
  const showTorque = Boolean(torqueBefore || torqueAfter);
  const showStats = showHp || showTorque;

  return (
    <div className="app-container">
      {/* Sidebar Controls */}
      <div className="controls-sidebar">
        <div style={{ marginBottom: '0.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img 
              src="/logo.png" 
              alt="ECU Pro Logo" 
              style={{ height: '32px', objectFit: 'contain' }} 
            />
            <span style={{ color: '#ffffff', fontWeight: 300, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
              Görsel Oluşturucu
            </span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#888', letterSpacing: '0.08em', marginTop: '0.3rem', opacity: 0.8 }}>
            by Batuhan OK
          </div>
        </div>

        <div className="control-group">
          <label>Tasarım Şablonu (Layout)</label>
          <select value={layoutStyle} onChange={e => setLayoutStyle(e.target.value)}>
            <option value="standard">1. Layout</option>
            <option value="modern-asymmetric">2. Layout</option>
          </select>
        </div>

        <div className="control-group">
          <label>Format Seçimi</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={`btn ${format === 'post' ? 'btn-primary' : ''}`}
              style={{ flex: 1, backgroundColor: format === 'post' ? undefined : 'var(--bg-input)' }}
              onClick={() => setFormat('post')}
            >
              Instagram Post (4:5)
            </button>
            <button 
              className={`btn ${format === 'story' ? 'btn-primary' : ''}`}
              style={{ flex: 1, backgroundColor: format === 'story' ? undefined : 'var(--bg-input)' }}
              onClick={() => setFormat('story')}
            >
              Story (9:16)
            </button>
          </div>
        </div>

        {/* Photo Options (Gallery or Live Camera) */}
        <div className="control-group">
          <label>Fotoğraf Kaynağı</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div className="file-upload" style={{ flex: 1, minWidth: '130px' }}>
              <button className="btn" style={{ width: '100%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                <ImageIcon size={18} /> Galeriden Seç
              </button>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </div>

            {isCameraActive ? (
              <button className="btn btn-primary" style={{ flex: 1, minWidth: '130px' }} onClick={capturePhoto}>
                <Camera size={18} /> Fotoğrafı Çek
              </button>
            ) : (
              <button className="btn" style={{ flex: 1, minWidth: '130px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }} onClick={startCamera}>
                <Camera size={18} /> Canlı Kamera
              </button>
            )}
          </div>
          {isCameraActive && (
            <button 
              onClick={stopCamera}
              style={{ background: 'none', border: 'none', color: '#ff5555', cursor: 'pointer', fontSize: '0.8rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <X size={14} /> Kamerayı Kapat
            </button>
          )}
        </div>

        {image && !isCameraActive && (
          <div className="control-group" style={{ backgroundColor: 'var(--bg-input)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Fotoğraf Konumu & Zoom</span>
              <button onClick={handleResetImage} style={{ background: 'none', border: 'none', color: 'var(--accent-orange)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem' }}>
                <RotateCcw size={12} /> Sıfırla
              </button>
            </label>

            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Yakınlaştır / Boyutlandır: {zoom.toFixed(2)}x</span>
              <input 
                type="range" 
                min="0.8" 
                max="3.5" 
                step="0.02" 
                value={zoom} 
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{ width: '100%', marginTop: '0.25rem' }}
              />
            </div>
            <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.5rem' }}>
              💡 İpucu: Önizleme üzerindeki fotoğrafı sürükleyerek hizalayabilirsiniz.
            </p>
          </div>
        )}

        <hr style={{ borderColor: 'var(--border-color)', margin: '0.5rem 0' }} />

        {/* Text Fields */}
        <div className="control-group">
          <label>Ana Başlık 1 (Beyaz)</label>
          <input type="text" value={mainTitle1} onChange={(e) => setMainTitle1(e.target.value)} placeholder="Örn: Mercedes" />
        </div>

        <div className="control-group">
          <label>Ana Başlık 2 (Turuncu)</label>
          <input type="text" value={mainTitle2} onChange={(e) => setMainTitle2(e.target.value)} placeholder="Örn: C200d" />
        </div>

        <div className="control-group">
          <label>Alt Başlık (Hazır Şablonlar & Özel Yazım)</label>
          <input 
            type="text" 
            list="subtitle-presets" 
            value={subtitle} 
            onChange={(e) => setSubtitle(e.target.value)} 
            placeholder="Örn: Stage Performans Yazılımı" 
          />
          <datalist id="subtitle-presets">
            <option value="Stage Performans Yazılımı" />
            <option value="DPF Arıza Çözümü" />
            <option value="Dizel Partikül Filtresi Arızası Çözümü" />
            <option value="EGR Arıza Çözümü" />
            <option value="DSG Optimizasyon Yazılımı" />
            <option value="AdBlue Arıza Çözümü" />
            <option value="Oksijen Sensör Arıza Çözümü" />
            <option value="Orjinal Yazılım Güncelleme" />
          </datalist>

          {/* Quick Preset Chips */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
            {[
              'Stage Performans Yazılımı',
              'DPF Arıza Çözümü',
              'Dizel Partikül Filtresi Arızası Çözümü',
              'EGR Arıza Çözümü',
              'DSG Optimizasyon Yazılımı',
              'AdBlue Arıza Çözümü',
              'Oksijen Sensör Arıza Çözümü',
              'Orjinal Yazılım Güncelleme'
            ].map((tmpl) => (
              <button
                key={tmpl}
                onClick={() => setSubtitle(tmpl)}
                style={{
                  background: subtitle === tmpl ? 'var(--accent-orange)' : 'var(--bg-input)',
                  color: subtitle === tmpl ? '#fff' : '#aaa',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  padding: '0.2rem 0.45rem',
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {tmpl}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <label>% Yakıt Tasarrufu (Opsiyonel)</label>
          <input 
            type="text" 
            value={fuelSavings} 
            onChange={(e) => setFuelSavings(e.target.value)} 
            placeholder="Örn: 20" 
          />
        </div>

        {/* HP & Torque Section Header with Minimal Clear Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>HP & Tork Değerleri</span>
          <button 
            onClick={clearStats} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-orange)', 
              cursor: 'pointer', 
              fontSize: '0.75rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem' 
            }}
            title="HP ve Tork değerlerini temizle (Tabloyu Gizle)"
          >
            <Trash2 size={12} /> HP/Tork Temizle
          </button>
        </div>

        {/* HP Fields */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="control-group" style={{ flex: 1 }}>
            <label>HP Önce</label>
            <input type="text" value={hpBefore} onChange={(e) => setHpBefore(e.target.value)} placeholder="Örn: 136" />
          </div>
          <div className="control-group" style={{ flex: 1 }}>
            <label>HP Sonra</label>
            <input type="text" value={hpAfter} onChange={(e) => setHpAfter(e.target.value)} placeholder="Örn: 165" />
          </div>
        </div>

        {/* Torque Fields */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="control-group" style={{ flex: 1 }}>
            <label>Tork Önce</label>
            <input type="text" value={torqueBefore} onChange={(e) => setTorqueBefore(e.target.value)} placeholder="Örn: 320" />
          </div>
          <div className="control-group" style={{ flex: 1 }}>
            <label>Tork Sonra</label>
            <input type="text" value={torqueAfter} onChange={(e) => setTorqueAfter(e.target.value)} placeholder="Örn: 390" />
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleDownload} style={{ marginTop: '1rem', padding: '1rem' }}>
          <Download size={20} />
          Görseli İndir
        </button>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#666', letterSpacing: '0.08em' }}>
          by Batuhan OK
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="preview-area">
        <div 
          ref={exportRef}
          className={`export-container ${format === 'post' ? 'format-post' : 'format-story'} layout-standard`}
        >
          {/* Background Area (Live Video or Image) */}
          <div 
            className="bg-image-container"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {isCameraActive ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : image ? (
              <div 
                className="bg-image"
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${image})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${zoom})`,
                  transformOrigin: 'center center'
                }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', backgroundColor: '#111' }}>
                Fotoğraf Yüklenmedi veya Canlı Kamerayı Açın
              </div>
            )}
          </div>

          {/* Gradient Darkening Overlays */}
          {layoutStyle === 'standard' && <div className="std-gradient-overlay"></div>}
          {layoutStyle === 'modern-asymmetric' && (
            <>
              <div className="asym-gradient-overlay"></div>
              <div className="asym-bottom-gradient"></div>
            </>
          )}
          
          {/* Top Left Logo (Standard Layout Only) */}
          {layoutStyle === 'standard' && (
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="std-logo"
            />
          )}

          {/* LAYOUT 1: STANDART LAYOUT */}
          {layoutStyle === 'standard' && (
            <div className="std-export-content">
              {/* Top Center Fuel Savings Badge */}
              {fuelSavings && (
                <div className="fuel-badge fuel-badge-top-center">
                  <Fuel size={14} className="fuel-badge-zap" />
                  <span>%{fuelSavings} Yakıt Tasarrufu</span>
                </div>
              )}

              {/* Title Section */}
              <div className="std-title-section">
                <h1 className="std-main-title">
                  <span className="std-title-white">{mainTitle1}</span>{' '}
                  <span className="std-title-orange">{mainTitle2}</span>
                </h1>
                
                {subtitle && <p className="std-subtitle">{subtitle}</p>}
              </div>

              {/* Performance Stats Section */}
              {showStats && (
                <div className="std-stats-container">
                  {/* HP Block */}
                  {showHp && (
                    <div className="std-stat-block">
                      <div className="std-icon-col">
                        <Gauge size={44} className="std-orange-icon" strokeWidth={1.8} />
                      </div>
                      <div className="std-stat-info">
                        <div className="std-stat-header">HP (GÜÇ)</div>
                        <div className="std-values-row">
                          <div className="std-val-box">
                            <span className="std-val-label">ÖNCESİ</span>
                            <span className="std-val-num">{hpBefore ? `${hpBefore} HP` : '-'}</span>
                          </div>
                          <MaterialChevronIcon className="std-arrow-divider" style={{ width: '18px', height: '18px' }} />
                          <div className="std-val-box">
                            <span className="std-val-label">SONRASI</span>
                            <span className="std-val-num">{hpAfter ? `${hpAfter} HP` : '-'}</span>
                          </div>
                        </div>
                        <div className="std-stat-subtext">DAHA FAZLA GÜÇ</div>
                      </div>
                    </div>
                  )}

                  {/* Torque Block */}
                  {showTorque && (
                    <div className="std-stat-block">
                      <div className="std-icon-col">
                        <VPistonGearIcon className="std-orange-icon" style={{ width: '44px', height: '44px' }} />
                      </div>
                      <div className="std-stat-info">
                        <div className="std-stat-header">TORK</div>
                        <div className="std-values-row">
                          <div className="std-val-box">
                            <span className="std-val-label">ÖNCESİ</span>
                            <span className="std-val-num">{torqueBefore ? `${torqueBefore} Nm` : '-'}</span>
                          </div>
                          <MaterialChevronIcon className="std-arrow-divider" style={{ width: '18px', height: '18px' }} />
                          <div className="std-val-box">
                            <span className="std-val-label">SONRASI</span>
                            <span className="std-val-num">{torqueAfter ? `${torqueAfter} Nm` : '-'}</span>
                          </div>
                        </div>
                        <div className="std-stat-subtext">DAHA FAZLA TORK</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer Contact Info */}
              <div className="std-footer">
                <div className="std-footer-item">
                  <div className="std-icon-circle"><Phone size={14} /></div>
                  <span>{PHONE}</span>
                </div>
                <div className="std-footer-divider">|</div>
                <div className="std-footer-item">
                  <div className="std-icon-circle"><Globe size={14} /></div>
                  <span>{WEBSITE}</span>
                </div>
              </div>
            </div>
          )}

          {/* LAYOUT 2: MODERN ASİMETRİK (Sol Başlık & Logo Ortada) */}
          {layoutStyle === 'modern-asymmetric' && (
            <div className="asym-export-content">
              {/* Top Left Titles & Vertical Stats */}
              <div className="asym-top-left-area">
                <div className="std-title-section" style={{ marginBottom: 0 }}>
                  <h1 className="std-main-title">
                    <span className="std-title-white">{mainTitle1}</span>{' '}
                    <span className="std-title-orange">{mainTitle2}</span>
                  </h1>
                  {subtitle && <p className="std-subtitle">{subtitle}</p>}
                </div>

                {showStats && (
                  <div className="asym-vertical-stats">
                    {/* HP Block */}
                    {showHp && (
                      <div className="std-stat-block">
                        <div className="std-icon-col">
                          <Gauge size={36} className="std-orange-icon" strokeWidth={1.8} />
                        </div>
                        <div className="std-stat-info">
                          <div className="std-stat-header">HP (GÜÇ)</div>
                          <div className="std-values-row">
                            <div className="std-val-box">
                              <span className="std-val-label">ÖNCESİ</span>
                              <span className="std-val-num">{hpBefore ? `${hpBefore} HP` : '-'}</span>
                            </div>
                            <MaterialChevronIcon className="std-arrow-divider" style={{ width: '18px', height: '18px' }} />
                            <div className="std-val-box">
                              <span className="std-val-label">SONRASI</span>
                              <span className="std-val-num">{hpAfter ? `${hpAfter} HP` : '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Torque Block */}
                    {showTorque && (
                      <div className="std-stat-block">
                        <div className="std-icon-col">
                          <VPistonGearIcon className="std-orange-icon" style={{ width: '36px', height: '36px' }} />
                        </div>
                        <div className="std-stat-info">
                          <div className="std-stat-header">TORK</div>
                          <div className="std-values-row">
                            <div className="std-val-box">
                              <span className="std-val-label">ÖNCESİ</span>
                              <span className="std-val-num">{torqueBefore ? `${torqueBefore} Nm` : '-'}</span>
                            </div>
                            <MaterialChevronIcon className="std-arrow-divider" style={{ width: '18px', height: '18px' }} />
                            <div className="std-val-box">
                              <span className="std-val-label">SONRASI</span>
                              <span className="std-val-num">{torqueAfter ? `${torqueAfter} Nm` : '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Centered Logo & Footer */}
              <div className="asym-bottom-area">
                {fuelSavings && (
                  <div className="fuel-badge">
                    <Fuel size={14} className="fuel-badge-zap" />
                    <span>%{fuelSavings} Yakıt Tasarrufu</span>
                  </div>
                )}
                <img src="/logo.png" alt="Logo" className="asym-center-logo" />
                <div className="std-footer">
                  <div className="std-footer-item">
                    <div className="std-icon-circle"><Phone size={14} /></div>
                    <span>{PHONE}</span>
                  </div>
                  <div className="std-footer-divider">|</div>
                  <div className="std-footer-item">
                    <div className="std-icon-circle"><Globe size={14} /></div>
                    <span>{WEBSITE}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Floating Snap Photo Button on Live Camera - Bottom Center */}
          {isCameraActive && (
            <button 
              onClick={capturePhoto}
              style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 30,
                backgroundColor: 'var(--accent-orange)',
                color: '#fff',
                border: '2px solid #fff',
                borderRadius: '50px',
                padding: '0.8rem 1.8rem',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.7)',
                pointerEvents: 'auto',
                cursor: 'pointer'
              }}
            >
              <Camera size={20} /> Fotoğrafı Çek
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
