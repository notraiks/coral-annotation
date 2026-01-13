import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import coralImage from '../../assets/coral2.jpg';
import { authService } from '../../api/services/authService.js';

function AnnotatePage() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [currentPatch, setCurrentPatch] = useState(null);
  const [patchHistory, setPatchHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Track current scale so we can clamp zoom-out at default
  const [scale, setScale] = useState(1);
  const DEFAULT_SCALE = 1;
  const MIN_SCALE = 1; // do not allow zoom out below default
  const MAX_SCALE = 5;

    // Modal visibility state
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isImageInfoOpen, setIsImageInfoOpen] = useState(false);

  // TODO later: replace with real per-patch metadata from backend
  const mockImageMetadata = {
    name: '2024_AUG_CG_D_T1/GOPR4527.JPG',
    date: '2024-08-03',
    monitoringStation: 'Coral Garden D',
    transectNumber: 'T1',
    quadratNumber: '1',
    temperature: '30',
    latitude: '13.51937',
    longitude: '120.95555',
    depth: '8',
    camera: 'GoPro 9',
    fullResolution: '5184 x 3888',
    patchResolution: '224 x 224', // placeholder; later tie to actual patch size
  };

  const labels = [
    { key: 'LC', text: 'Living Coral (LC)', color: 'bg-emerald-500 hover:bg-emerald-600' },
    { key: 'PB', text: 'Partially Bleached (PB)', color: 'bg-amber-400 hover:bg-amber-500 text-slate-900' },
    { key: 'DC', text: 'Dead Coral (DC)', color: 'bg-red-500 hover:bg-red-600' },
    { key: 'DCA', text: 'Dead Coral with Algae (DCA)', color: 'bg-violet-500 hover:bg-violet-600' },
  ];

  const fetchNextPatch = async () => {
    try {
      setLoading(true);
      setError(null);

      // FRONTEND MOCK: replace with real API later
      const mockPatch = {
        patchId: `patch-${Date.now()}`,
        imageUrl: coralImage,
        index: patchHistory.length + 1,
        total: 500,
      };

      setCurrentPatch(mockPatch);
      setPatchHistory([...patchHistory, mockPatch]);
      setHistoryIndex(patchHistory.length);
      setScale(DEFAULT_SCALE);
    } catch (err) {
      setError(err.message || 'Failed to load patch.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };
  
  useEffect(() => {
    fetchNextPatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLabel = async (labelKey) => {
    if (!currentPatch) return;
    try {
      setLoading(true);
      // FRONTEND MOCK: replace with POST /api/annotate later
      console.log(`Labeled ${currentPatch.patchId} as ${labelKey}`);
      await fetchNextPatch();
    } catch (err) {
      setError(err.message || 'Failed to save annotation.');
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentPatch(patchHistory[newIndex]);
      setScale(DEFAULT_SCALE);
    }
  };

  const handleNext = () => {
    if (historyIndex < patchHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentPatch(patchHistory[newIndex]);
      setScale(DEFAULT_SCALE);
    } else {
      fetchNextPatch();
    }
  };

  if (loading && !currentPatch) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-slate-400">Loading patch...</p>
        </div>
      </div>
    );
  }

  if (error && !currentPatch) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={handleLogout} variant="primary">
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900 overflow-hidden">
      <TransformWrapper
        initialScale={DEFAULT_SCALE}
        minScale={MIN_SCALE}
        maxScale={MAX_SCALE}
        limitToBounds={true}
        centerOnInit={true}
        // keep internal scale in sync so we can disable zoom-out at default
        onTransformed={({ state }) => {
          setScale(state.scale);
        }}
        wheel={{
          step: 40,
          disabled: false,
          touchPadDisabled: false,
        }}
        pinch={{ disabled: false }}
        panning={{ disabled: false, velocityDisabled: false }}
        doubleClick={{ disabled: false, step: 0.7, animation: true }}
      >
        {({ zoomIn, zoomOut, resetTransform, setTransform, state }) => {
          const canZoomOut = scale > DEFAULT_SCALE + 1e-3; // small epsilon

          const safeZoomIn = () => {
            if (scale < MAX_SCALE) {
              zoomIn();
            }
          };

          const safeZoomOut = () => {
            if (!canZoomOut) return; // do not zoom out below default
            zoomOut();
          };

          const safeReset = () => {
            resetTransform();
          };

          return (
            <>
              {/* FULLSCREEN IMAGE */}
              <div className="w-full h-full flex items-center justify-center">
                <TransformComponent
                  wrapperClass="w-full h-full flex items-center justify-center"
                  contentClass="max-w-[100vw] max-h-[100vh] flex items-center justify-center"
                >
                  {currentPatch && (
                    <img
                      src={currentPatch.imageUrl}
                      alt="Coral patch for annotation"
                      className="w-full h-full object-contain"
                    />
                  )}
                </TransformComponent>
              </div>

              {/* ZOOM CONTROLS - TOP LEFT, TRANSPARENT */}
              <div className="absolute top-4 left-4 z-50 flex gap-2 bg-transparent">
                <button
                  onClick={safeZoomIn}
                  className="px-2 py-1.5 rounded-md text-xs sm:text-sm font-medium text-slate-100 bg-slate-900/40 hover:bg-slate-900/60 border border-slate-700/60"
                  title="Zoom in"
                >
                  🔍+
                </button>
                <button
                  onClick={safeZoomOut}
                  disabled={!canZoomOut}
                  className="px-2 py-1.5 rounded-md text-xs sm:text-sm font-medium text-slate-100 bg-slate-900/40 hover:bg-slate-900/60 border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Zoom out"
                >
                  🔍−
                </button>
                <button
                  onClick={safeReset}
                  className="px-2 py-1.5 rounded-md text-xs sm:text-sm font-medium text-slate-100 bg-slate-900/40 hover:bg-slate-900/60 border border-slate-700/60"
                  title="Reset view"
                >
                  ↺
                </button>
              </div>

              {/* TOP-RIGHT: OPTIONS + IMAGE INFO */}
              <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-transparent">
                {/* Image Info Button */}
                <button
                  onClick={() => setIsImageInfoOpen(true)}
                  className="px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-emerald-200 bg-slate-900/40 hover:bg-slate-900/60 border border-emerald-500/60"
                  title="View image metadata"
                >
                  Image Info
                </button>

                {/* Options Button (opens modal) */}
                <button
                  onClick={() => setIsOptionsOpen(true)}
                  className="px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-slate-200 bg-slate-900/40 hover:bg-slate-900/60 border border-slate-600/70"
                  title="Options"
                >
                  Options
                </button>
              </div>

              {/* PROGRESS - TOP CENTER, SEMI-TRANSPARENT */}
              {currentPatch && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-lg bg-slate-900/40 border border-slate-700/70">
                  <p className="text-xs sm:text-sm text-slate-200">
                    Patch{' '}
                    <span className="text-emerald-400 font-semibold">
                      {currentPatch.index}
                    </span>{' '}
                    of{' '}
                    <span className="text-emerald-400 font-semibold">
                      {currentPatch.total}
                    </span>
                  </p>
                </div>
              )}

              {/* PREVIOUS - BOTTOM LEFT, TRANSPARENT */}
              <button
                onClick={handlePrevious}
                disabled={historyIndex <= 0 || loading}
                className="absolute bottom-6 left-6 z-40 px-4 py-2 rounded-md text-xs sm:text-sm font-medium text-slate-100 bg-slate-900/40 hover:bg-slate-900/60 border border-slate-700/70 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous patch"
              >
                ← Previous
              </button>

              {/* NEXT - BOTTOM RIGHT, TRANSPARENT */}
              <button
                onClick={handleNext}
                disabled={loading}
                className="absolute bottom-6 right-6 z-40 px-4 py-2 rounded-md text-xs sm:text-sm font-medium text-slate-100 bg-slate-900/40 hover:bg-slate-900/60 border border-slate-700/70 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next patch"
              >
                Next →
              </button>

              {/* LABELS - BOTTOM CENTER, CONTAINER TRANSLUCENT, BUTTONS SOLID */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
                <div className="px-4 py-3 rounded-2xl bg-slate-900/30 border border-slate-700/60 backdrop-blur-sm max-w-[95vw] sm:max-w-3xl">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {labels.map((label) => (
                      <button
                        key={label.key}
                        onClick={() => handleLabel(label.key)}
                        disabled={loading}
                        className={`${label.color} px-3 py-2 text-white text-xs sm:text-sm font-medium rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {label.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* LOADING OVERLAY */}
              {loading && (
                <div className="absolute inset-0 bg-black/25 z-30 flex items-center justify-center">
                  <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-6">
                    <Spinner size="lg" className="mx-auto mb-2" />
                    <p className="text-slate-200 text-sm">Processing...</p>
                  </div>
                </div>
              )}

              {/* OPTIONS MODAL */}
              {isOptionsOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
                  <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-sm w-full mx-4">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                      <h2 className="text-sm sm:text-base font-semibold text-slate-100">
                        Options
                      </h2>
                      <button
                        onClick={() => setIsOptionsOpen(false)}
                        className="text-slate-400 hover:text-slate-200 text-lg leading-none"
                        aria-label="Close options"
                      >
                        ×
                      </button>
                    </div>
                    <div className="px-4 py-4 space-y-3">
                      <p className="text-xs sm:text-sm text-slate-400">
                        Manage your current annotation session. More options can be
                        added here later.
                      </p>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            setIsOptionsOpen(false);
                            handleLogout();
                          }}
                          className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-sm font-medium text-white transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* IMAGE INFO MODAL */}
              {isImageInfoOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
                  <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full mx-4">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                      <h2 className="text-sm sm:text-base font-semibold text-slate-100">
                        Image Information
                      </h2>
                      <button
                        onClick={() => setIsImageInfoOpen(false)}
                        className="text-slate-400 hover:text-slate-200 text-lg leading-none"
                        aria-label="Close image info"
                      >
                        ×
                      </button>
                    </div>
                    <div className="px-4 py-4 max-h-[70vh] overflow-y-auto text-xs sm:text-sm text-slate-200 space-y-3">
                      <div>
                        <h3 className="text-xs font-semibold text-slate-400 mb-1">
                          Monitoring Metadata
                        </h3>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <dt className="text-slate-400">Name</dt>
                          <dd className="text-slate-100">{mockImageMetadata.name}</dd>

                          <dt className="text-slate-400">Date</dt>
                          <dd className="text-slate-100">{mockImageMetadata.date}</dd>

                          <dt className="text-slate-400">Monitoring Station</dt>
                          <dd className="text-slate-100">
                            {mockImageMetadata.monitoringStation}
                          </dd>

                          <dt className="text-slate-400">Transect</dt>
                          <dd className="text-slate-100">
                            {mockImageMetadata.transectNumber}
                          </dd>

                          <dt className="text-slate-400">Quadrat</dt>
                          <dd className="text-slate-100">
                            {mockImageMetadata.quadratNumber}
                          </dd>

                          <dt className="text-slate-400">Temperature (°C)</dt>
                          <dd className="text-slate-100">
                            {mockImageMetadata.temperature}
                          </dd>
                        </dl>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold text-slate-400 mb-1">
                          Location & Depth
                        </h3>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <dt className="text-slate-400">Latitude</dt>
                          <dd className="text-slate-100">
                            {mockImageMetadata.latitude}
                          </dd>

                          <dt className="text-slate-400">Longitude</dt>
                          <dd className="text-slate-100">
                            {mockImageMetadata.longitude}
                          </dd>

                          <dt className="text-slate-400">Depth (m)</dt>
                          <dd className="text-slate-100">{mockImageMetadata.depth}</dd>
                        </dl>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold text-slate-400 mb-1">
                          Imaging
                        </h3>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <dt className="text-slate-400">Camera</dt>
                          <dd className="text-slate-100">
                            {mockImageMetadata.camera}
                          </dd>

                          <dt className="text-slate-400">Full resolution</dt>
                          <dd className="text-slate-100">
                            {mockImageMetadata.fullResolution}
                          </dd>

                          <dt className="text-slate-400">Patch resolution</dt>
                          <dd className="text-slate-100">
                            {mockImageMetadata.patchResolution}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        }}
      </TransformWrapper>
    </div>
  );
}

export default AnnotatePage;
