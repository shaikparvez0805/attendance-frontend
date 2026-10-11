export default function Message({ msg }) {
  if (!msg) return null;
  return <div className={`alert ${msg.type}`}>{msg.text}</div>;
}
