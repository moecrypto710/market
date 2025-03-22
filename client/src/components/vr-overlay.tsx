export default function VROverlay() {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md py-2 px-4 rounded-full z-50">
      <div className="flex items-center">
        <i className="fas fa-vr-cardboard text-[#ffeb3b] ml-2"></i>
        <span>وضع الواقع الافتراضي نشط</span>
      </div>
    </div>
  );
}
