export function FieldScanPage() {
  const src = `${import.meta.env.BASE_URL}field-test-scan.html`;
  return (
    <iframe
      title="مسح الدرون ورصد المخلفات"
      src={src}
      className="w-full border-0 block"
      style={{ height: "calc(100vh - 7.25rem)", minHeight: 560 }}
    />
  );
}
