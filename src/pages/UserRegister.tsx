import { useRef, useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, FileText, Leaf, Loader2, MapPin, ScanLine, UserPlus, XCircle } from "lucide-react";
import { createWorker } from "tesseract.js";
import * as faceapi from "@vladmandic/face-api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const FACE_MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";

export default function UserRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [residentAddress, setResidentAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [residencyConfirmed, setResidencyConfirmed] = useState(false);
  const [idDocument, setIdDocument] = useState<{ name: string; type: string; data: string; ocrText: string } | null>(null);
  const [idCheckStatus, setIdCheckStatus] = useState<"idle" | "checking" | "matched" | "not-matched" | "error">("idle");
  const [idCheckStep, setIdCheckStep] = useState("Preparing your ID...");
  const [idCheckModal, setIdCheckModal] = useState<"checking" | "matched" | "not-matched" | "error" | null>(null);
  const [faceConsent, setFaceConsent] = useState(false);
  const [faceStatus, setFaceStatus] = useState<"idle" | "loading" | "ready" | "checking" | "matched" | "not-matched" | "error">("idle");
  const [faceMessage, setFaceMessage] = useState("");
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [livenessStep, setLivenessStep] = useState("Preparing live camera check...");
  const videoRef = useRef<HTMLVideoElement>(null);
  const faceStreamRef = useRef<MediaStream | null>(null);
  const faceModelsLoadedRef = useRef(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser, registerUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (currentUser) {
    return <Navigate to="/user" replace />;
  }

  const handleVerification = (e: React.FormEvent) => {
    e.preventDefault();

    if (!residentAddress.trim() || !residencyConfirmed || !idDocument || idCheckStatus !== "matched") {
      toast({
        title: "Verification needed",
        description: idCheckStatus === "not-matched"
          ? "You cannot register because the ID address does not match Barangay Tinampa-an."
          : "Enter the address, confirm residency, and upload an ID that shows Barangay Tinampa-an.",
        variant: "destructive",
      });
      return;
    }

    setIsVerified(true);
  };

  const stopFaceCamera = () => {
    faceStreamRef.current?.getTracks().forEach((track) => track.stop());
    faceStreamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const startFaceScan = async () => {
    if (!faceConsent) {
      toast({ title: "Consent required", description: "Allow face verification before starting the camera.", variant: "destructive" });
      return;
    }

    try {
      setFaceModalOpen(true);
      setFaceStatus("loading");
      setLivenessStep("Loading face verification models...");
      setFaceMessage("Loading face verification models...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 1280 }, aspectRatio: { ideal: 0.75 } },
        audio: false,
      });
      faceStreamRef.current = stream;
      if (!faceModelsLoadedRef.current) {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(FACE_MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(FACE_MODEL_URL),
        ]);
        faceModelsLoadedRef.current = true;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setFaceStatus("ready");
      setLivenessStep("Liveness check ready - keep your face inside the frame.");
      setFaceMessage("Position your face inside the frame, then capture.");
    } catch {
      stopFaceCamera();
      setFaceStatus("error");
      setFaceModalOpen(true);
      setLivenessStep("Camera check failed.");
      setFaceMessage("Camera or face models could not be loaded. Check camera permission and try again.");
    }
  };

  const captureFace = async () => {
    if (!videoRef.current || !idDocument) return;

    try {
      setFaceStatus("checking");
      setLivenessStep("Reading the live face and checking liveness...");
      setFaceMessage("Comparing your live face with the ID photo...");
      videoRef.current.style.transform = "none";
      const canvas = document.createElement("canvas");
      const sourceWidth = videoRef.current.videoWidth;
      const sourceHeight = videoRef.current.videoHeight;
      const portraitWidth = Math.min(sourceWidth, Math.round(sourceHeight * 0.75));
      const cropX = Math.max(0, Math.round((sourceWidth - portraitWidth) / 2));
      canvas.width = portraitWidth;
      canvas.height = sourceHeight;
      canvas.getContext("2d")?.drawImage(videoRef.current, cropX, 0, portraitWidth, sourceHeight, 0, 0, portraitWidth, sourceHeight);
      const selfieImage = await faceapi.fetchImage(canvas.toDataURL("image/jpeg", 0.9));
      const idImage = await faceapi.fetchImage(idDocument.data);
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
      const [idFace, selfieFace] = await Promise.all([
        faceapi.detectSingleFace(idImage, options).withFaceLandmarks().withFaceDescriptor(),
        faceapi.detectSingleFace(selfieImage, options).withFaceLandmarks().withFaceDescriptor(),
      ]);
      stopFaceCamera();

      if (!idFace || !selfieFace) {
        setFaceStatus("not-matched");
        setLivenessStep("Liveness check could not confirm a clear face.");
        setFaceMessage("A clear face was not detected in the ID or camera image.");
        return;
      }

      const distance = faceapi.euclideanDistance(idFace.descriptor, selfieFace.descriptor);
      const matched = distance <= 0.6;
      setFaceStatus(matched ? "matched" : "not-matched");
      setLivenessStep(matched ? "Liveness and face match completed." : "Liveness completed, but the face did not match.");
      setFaceMessage(matched ? "Face matched successfully." : "The live face does not match the ID photo.");
    } catch {
      stopFaceCamera();
      setFaceStatus("error");
      setLivenessStep("Liveness check failed.");
      setFaceMessage("Face verification failed. Please try again with better lighting.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVerified) {
      toast({
        title: "Verify residency first",
        description: "Complete the Tinampa-an residency verification step before registration.",
        variant: "destructive",
      });
      return;
    }

    if (!faceConsent || faceStatus !== "matched") {
      toast({ title: "Face verification required", description: "Complete the face scan and confirm that you consent to face verification.", variant: "destructive" });
      return;
    }

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Use at least 8 characters for your password.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Re-enter the same password in both fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTimeout(async () => {
      const result = await registerUser(name, email, password, {
        residentAddress: `${residentAddress.trim()}, Barangay Tinampa-an, Cadiz City`,
        contactNumber: contactNumber.trim(),
        residencyConfirmed,
        faceVerified: faceStatus === "matched",
        idDocument,
      });

      if (result.success) {
        toast({
          title: "Account created",
          description: "Your ID was submitted and is pending Admin/BHW review.",
        });
        navigate("/user");
      } else {
        toast({
          title: "Registration failed",
          description: result.message,
          variant: "destructive",
        });
      }

      setIsLoading(false);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {idCheckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-primary/20 bg-card p-6 text-center shadow-2xl">
            {idCheckModal === "checking" ? (
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <div className="absolute inset-1 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <ScanLine className="h-8 w-8 animate-pulse" />
              </div>
            ) : (
              <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${idCheckModal === "matched" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                {idCheckModal === "matched" ? <CheckCircle2 className="h-12 w-12 animate-in zoom-in" /> : <XCircle className="h-12 w-12 animate-in zoom-in" />}
              </div>
            )}
            <div className="mt-5 flex items-center justify-center gap-2">
              {idCheckModal === "checking" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              <h2 className="text-lg font-semibold text-foreground">
                {idCheckModal === "checking" ? "Checking your ID" : idCheckModal === "matched" ? "ID address matched" : "ID address not matched"}
              </h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {idCheckModal === "checking" ? idCheckStep : idCheckModal === "matched" ? "The uploaded ID shows Barangay Tinampa-an." : idCheckModal === "not-matched" ? "You cannot register because the ID address is outside Barangay Tinampa-an." : "Use a clear JPG or PNG and try again."}
            </p>
            {idCheckModal === "matched" && (
              <>
                <label className="mt-5 flex items-start gap-3 text-left text-sm text-foreground">
                  <input type="checkbox" checked={faceConsent} onChange={(event) => setFaceConsent(event.target.checked)} className="mt-1 h-4 w-4 rounded border-input" />
                  <span>I consent to use my camera for the one-time liveness and face comparison.</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (!faceConsent) {
                      toast({ title: "Consent required", description: "Allow camera face verification to continue.", variant: "destructive" });
                      return;
                    }
                    setIsVerified(true);
                    setIdCheckModal(null);
                    void startFaceScan();
                  }}
                  className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Continue to face verification
                </button>
              </>
            )}
            {idCheckModal === "checking" && <>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-2/3 rounded-full bg-primary animate-pulse" />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Please keep this window open while the verification bot is working.</p>
            </>}
          </div>
        </div>
      )}
      {faceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-6 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-primary/20 bg-card p-5 text-center shadow-2xl">
            {(faceStatus === "loading" || faceStatus === "ready" || faceStatus === "checking") && (
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <div className="absolute inset-1 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <ScanLine className="h-7 w-7 animate-pulse" />
              </div>
            )}
            {faceStatus === "matched" && <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-10 w-10 animate-in zoom-in" /></div>}
            {(faceStatus === "not-matched" || faceStatus === "error") && <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600"><XCircle className="h-10 w-10 animate-in zoom-in" /></div>}

            <h2 className="mt-4 text-lg font-semibold text-foreground">
              {faceStatus === "matched" ? "Face and liveness verified" : faceStatus === "not-matched" ? "Face verification failed" : faceStatus === "error" ? "Liveness check unavailable" : "Live liveness reading"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{faceStatus === "matched" ? "Your live face matches the photo on the uploaded ID." : faceStatus === "not-matched" ? faceMessage : faceStatus === "error" ? faceMessage : livenessStep}</p>

            {(faceStatus === "loading" || faceStatus === "ready" || faceStatus === "checking") && (
              <div className="relative mx-auto mt-4 w-full max-w-xs overflow-hidden rounded-2xl border-2 border-primary/40 bg-muted p-1 shadow-[0_0_28px_rgba(37,99,235,0.16)]">
                <video ref={videoRef} autoPlay muted playsInline className="aspect-[3/4] w-full object-cover" style={{ transform: "none", rotate: "0deg" }} />
                <div className="pointer-events-none absolute inset-x-8 inset-y-7 rounded-[48%] border-2 border-primary/80 shadow-[0_0_0_999px_rgba(15,23,42,0.28)]" style={{ animation: "face-frame-pulse 2.2s ease-in-out infinite" }} />
                <div className="pointer-events-none absolute left-8 right-8 h-1 rounded-full bg-cyan-300 shadow-[0_0_14px_4px_rgba(34,211,238,0.8)]" style={{ animation: "face-scan-sweep 2.4s ease-in-out infinite" }} />
                <div className="pointer-events-none absolute left-4 top-4 h-7 w-7 border-l-2 border-t-2 border-cyan-300" />
                <div className="pointer-events-none absolute right-4 top-4 h-7 w-7 border-r-2 border-t-2 border-cyan-300" />
                <div className="pointer-events-none absolute bottom-4 left-4 h-7 w-7 border-b-2 border-l-2 border-cyan-300" />
                <div className="pointer-events-none absolute bottom-4 right-4 h-7 w-7 border-b-2 border-r-2 border-cyan-300" />
              </div>
            )}

            {faceStatus === "loading" && <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full w-2/3 rounded-full bg-primary animate-pulse" /></div>}
            {faceStatus === "checking" && <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700" style={{ animation: "face-status-pulse 1.8s ease-in-out infinite" }}><span className="h-2 w-2 rounded-full bg-emerald-500" /> Please keep your face still while the live check is running.</div>}

            {faceStatus === "ready" && <button type="button" onClick={captureFace} className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">Read liveness and compare face</button>}
            {faceStatus === "matched" && <button type="button" onClick={() => setFaceModalOpen(false)} className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">Continue to account details</button>}
            {(faceStatus === "not-matched" || faceStatus === "error") && <button type="button" onClick={() => { setFaceModalOpen(false); setFaceStatus("idle"); setFaceMessage(""); }} className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">Try face scan again</button>}
          </div>
        </div>
      )}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-sky/40 via-background to-peach p-12">
        <div className="absolute right-20 top-12 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-16 left-16 h-40 w-40 rounded-full bg-sage/40 blur-3xl" />
        <div className="relative z-10 max-w-md rounded-3xl border border-border/60 bg-background/80 p-8 shadow-xl backdrop-blur">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <UserPlus className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-foreground">Create a user account</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Register once to access your Nutri-Track portal and keep your nutrition information in one place.
          </p>
          <div className="mt-8 grid gap-3 text-sm">
            <div className="rounded-2xl border border-border/60 bg-background/90 px-4 py-3">Quick account setup</div>
            <div className="rounded-2xl border border-border/60 bg-background/90 px-4 py-3">Private session stored on this device</div>
            <div className="rounded-2xl border border-border/60 bg-background/90 px-4 py-3">Instant access after registration</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm section-enter">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="flex items-center gap-2.5 mb-2 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">Nutri-Track</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mt-4">Register</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Verify Tinampa-an residency first, then create your account.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2 text-xs font-medium">
            <div className={`rounded-lg border px-3 py-2 ${isVerified ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted text-foreground"}`}>
              1. Verification
            </div>
            <div className={`rounded-lg border px-3 py-2 ${isVerified ? "border-border bg-muted text-foreground" : "border-border bg-background text-muted-foreground"}`}>
              2. Account
            </div>
          </div>

          {!isVerified ? (
            <form onSubmit={handleVerification} className="mt-8 space-y-5">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Tinampa-an Resident Verification</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      This portal is for guardians living in Barangay Tinampa-an, Cadiz City.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Purok / Sitio / Street</label>
                <input
                  type="text"
                  value={residentAddress}
                  onChange={(e) => setResidentAddress(e.target.value)}
                  placeholder="Example: Purok 2"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">Barangay Tinampa-an, Cadiz City</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Proof of residency / valid ID</label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-primary/40 bg-card p-4 hover:bg-primary/5 transition-colors">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">Upload ID document</span>
                    <span className="block truncate text-xs text-muted-foreground">JPG, PNG, or PDF · maximum 5 MB</span>
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="sr-only"
                    required={!idDocument}
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        toast({ title: "File is too large", description: "Choose an ID document up to 5 MB.", variant: "destructive" });
                        event.currentTarget.value = "";
                        return;
                      }
                      setIdCheckStatus("checking");
                      setIdCheckModal("checking");
                      setIdCheckStep("Preparing your ID...");
                      setIdDocument(null);
                      try {
                        const dataUrl = await new Promise<string>((resolve, reject) => {
                          const reader = new FileReader();
                          reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read file"));
                          reader.onerror = () => reject(new Error("Could not read file"));
                          reader.readAsDataURL(file);
                        });
                        setIdCheckStep("Reading ID details...");
                        const worker = await createWorker("eng");
                        const result = await worker.recognize(dataUrl);
                        const ocrText = result.data.text;
                        await worker.terminate();
                        setIdCheckStep("Checking the Barangay Tinampa-an address...");
                        const normalizedText = ocrText.toLowerCase().replace(/[–—]/g, "-");
                        const matched = normalizedText.includes("tinampa-an") || normalizedText.includes("tinampa an") || normalizedText.includes("tinampaan");
                        setIdDocument({ name: file.name, type: file.type, data: dataUrl, ocrText });
                        setIdCheckStatus(matched ? "matched" : "not-matched");
                        setIdCheckModal(matched ? "matched" : "not-matched");
                        if (!matched) window.setTimeout(() => setIdCheckModal(null), 1800);
                        if (!matched) {
                          toast({ title: "Address does not match", description: "The ID does not show Barangay Tinampa-an. You cannot register with this document.", variant: "destructive" });
                        }
                      } catch {
                        setIdCheckStatus("error");
                        setIdCheckModal("error");
                        window.setTimeout(() => setIdCheckModal(null), 1800);
                        toast({ title: "ID could not be checked", description: "Use a clear JPG or PNG showing the complete address, then try again.", variant: "destructive" });
                      }
                    }}
                  />
                </label>
                {idCheckStatus === "checking" && <p className="mt-1.5 text-xs text-muted-foreground">Bot is reading the ID address...</p>}
                {idDocument && idCheckStatus === "matched" && <p className="mt-1.5 text-xs text-primary">Address matched: {idDocument.name}</p>}
                {idCheckStatus === "not-matched" && <p className="mt-1.5 text-xs text-destructive">You cannot continue because the ID address is outside Barangay Tinampa-an.</p>}
                <p className="mt-1.5 text-xs text-muted-foreground">The automatic check looks for Barangay Tinampa-an in the ID address. Clear images work best.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Contact number</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                />
              </div>

              <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={residencyConfirmed}
                  onChange={(e) => setResidencyConfirmed(e.target.checked)}
                  required
                  className="mt-1 h-4 w-4 rounded border-input"
                />
                <span>
                  I confirm that I am a resident of Barangay Tinampa-an and the information provided is true.
                </span>
              </label>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Continue to Account Setup
              </button>
            </form>
          ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">ID submitted for verification</p>
                <p className="mt-1 text-muted-foreground">{residentAddress.trim()}, Barangay Tinampa-an, Cadiz City</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <ScanLine className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Face verification</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">Take a live camera scan so the system can compare your face with the photo on the uploaded ID.</p>
                </div>
              </div>

              <label className="mt-4 flex items-start gap-3 text-sm text-foreground">
                <input type="checkbox" checked={faceConsent} onChange={(event) => setFaceConsent(event.target.checked)} className="mt-1 h-4 w-4 rounded border-input" />
                <span>I consent to a one-time face comparison for account verification.</span>
              </label>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {(faceStatus === "idle" || faceStatus === "error" || faceStatus === "not-matched") && (
                  <button type="button" onClick={startFaceScan} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                    Start face scan
                  </button>
                )}
                {(faceStatus === "ready" || faceStatus === "checking") && (
                  <button type="button" onClick={captureFace} disabled={faceStatus === "checking"} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
                    {faceStatus === "checking" ? "Comparing..." : "Capture and compare"}
                  </button>
                )}
                {faceStatus === "matched" && <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Face matched</span>}
              </div>
              {faceMessage && <p className={`mt-2 text-xs ${faceStatus === "matched" ? "text-emerald-600" : faceStatus === "not-matched" || faceStatus === "error" ? "text-destructive" : "text-muted-foreground"}`}>{faceMessage}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Confirm password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/user/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
