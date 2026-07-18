"use client";

import { Camera, CameraOff, CheckCircle2, Keyboard, LoaderCircle, ScanLine, ShieldX } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { scanAccreditationAction, type CheckInState } from "@/app/admin/check-in/actions";

const initialState: CheckInState = { message: "", status: "idle" };

type Detection = { rawValue: string };
type Detector = { detect(source: HTMLVideoElement): Promise<Detection[]> };
type DetectorConstructor = new (options: { formats: string[] }) => Detector;

export function CheckInScanner({ initialToken = "" }: { initialToken?: string }) {
  const [state, action, pending] = useActionState(scanAccreditationAction, initialState);
  const [cameraError, setCameraError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const tokenRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);

  function stopCamera() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  }

  async function startCamera() {
    setCameraError("");
    const BarcodeDetector = (window as unknown as { BarcodeDetector?: DetectorConstructor }).BarcodeDetector;
    if (!BarcodeDetector) {
      setCameraError("Automatic QR detection is not supported by this browser. Paste the badge link below.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: "environment" } } });
      streamRef.current = stream;
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      let locked = false;
      const detect = async () => {
        if (!videoRef.current || !streamRef.current || locked) return;
        try {
          const codes = await detector.detect(videoRef.current);
          const rawValue = codes[0]?.rawValue;
          if (rawValue && tokenRef.current && formRef.current) {
            locked = true;
            tokenRef.current.value = rawValue;
            stopCamera();
            formRef.current.requestSubmit();
            return;
          }
        } catch {
          // A transient unreadable frame is expected while the camera is moving.
        }
        frameRef.current = requestAnimationFrame(detect);
      };
      frameRef.current = requestAnimationFrame(detect);
    } catch {
      stopCamera();
      setCameraError("Camera access was refused or is unavailable. Paste the badge link below.");
    }
  }

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const allowed = state.outcome === "allowed";

  return <div className="grid gap-4">
    <article className={`overflow-hidden rounded-2xl border-2 shadow-lg ${state.outcome ? allowed ? "border-emerald-500 bg-emerald-950" : "border-rose-500 bg-rose-950" : "border-acv-gold bg-acv-night"}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-black sm:aspect-video">
        <video className={`h-full w-full object-cover ${cameraActive ? "block" : "hidden"}`} muted playsInline ref={videoRef} />
        {!cameraActive ? <div className="absolute inset-0 grid place-items-center p-8 text-center text-white"><div><ScanLine className="mx-auto size-16 text-acv-gold" /><h2 className="mt-4 text-2xl font-black">Ready to scan</h2><p className="mt-2 text-sm text-slate-300">Point the rear camera at an ACV accreditation QR code.</p></div></div> : null}
        {cameraActive ? <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-acv-gold shadow-[0_0_0_999px_rgba(0,0,0,0.25)]"><span className="absolute left-1/2 top-1/2 h-0.5 w-4/5 -translate-x-1/2 bg-acv-gold shadow-[0_0_12px_#fbbf24]" /></div> : null}
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-acv-gold px-4 py-3 text-sm font-black text-acv-night" onClick={cameraActive ? stopCamera : startCamera} type="button">{cameraActive ? <CameraOff className="size-5" /> : <Camera className="size-5" />}{cameraActive ? "Stop camera" : "Open camera"}</button>
        <div className="rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-center text-sm font-bold text-white">No personal data stored in QR</div>
      </div>
    </article>

    {cameraError ? <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">{cameraError}</p> : null}

    {state.outcome ? <article aria-live="polite" className={`rounded-xl border-2 p-5 ${allowed ? "border-emerald-400 bg-emerald-50" : "border-rose-400 bg-rose-50"}`}>
      <div className="flex items-start gap-4">{allowed ? <CheckCircle2 className="size-10 shrink-0 text-emerald-700" /> : <ShieldX className="size-10 shrink-0 text-rose-700" />}<div><p className={`text-xs font-black uppercase tracking-widest ${allowed ? "text-emerald-700" : "text-rose-700"}`}>{allowed ? "Access allowed" : "Access denied"}</p><h2 className="mt-1 text-2xl font-black text-acv-ink">{state.fullName}</h2><p className="mt-1 font-semibold text-slate-700">{state.organizationName} · {state.badgeType}</p><p className="mt-2 font-mono text-xs font-bold text-slate-600">{state.badgeNumber}</p>{state.denialReason ? <p className="mt-3 font-bold text-rose-800">{state.denialReason}</p> : null}</div></div>
    </article> : state.message ? <p aria-live="polite" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{state.message}</p> : null}

    <form action={action} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2" ref={formRef}>
      <label className="grid gap-1 text-xs font-bold uppercase text-slate-600">Checkpoint<select className="rounded-md border border-slate-200 px-3 py-3 text-base font-semibold normal-case" defaultValue="Main Gate" name="checkpoint"><option>Main Gate</option><option>Vendor Gate</option><option>Backstage</option><option>Production Access</option><option>VIP Entrance</option></select></label>
      <label className="grid gap-1 text-xs font-bold uppercase text-slate-600">Movement<select className="rounded-md border border-slate-200 px-3 py-3 text-base font-semibold normal-case" defaultValue="entry" name="direction"><option value="entry">Entry</option><option value="exit">Exit</option></select></label>
      <label className="grid gap-1 text-xs font-bold uppercase text-slate-600 sm:col-span-2"><span className="inline-flex items-center gap-2"><Keyboard className="size-4" />Manual fallback</span><input autoComplete="off" className="rounded-md border border-slate-200 px-3 py-3 font-mono text-sm normal-case" defaultValue={initialToken} name="token" placeholder="Paste the full badge link or opaque token" ref={tokenRef} required /></label>
      <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-acv-palm px-4 py-3 text-sm font-black text-white sm:col-span-2" disabled={pending}>{pending ? <LoaderCircle className="size-5 animate-spin" /> : <ScanLine className="size-5" />}Check accreditation</button>
    </form>
  </div>;
}
