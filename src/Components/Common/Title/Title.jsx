import "./Title.scss";

const Title = ({ titleText, size = 18, margin_b = 24 }) => {
  return (
    <div className="title" style={{ marginBottom: margin_b }}>
      <h3 style={{ fontSize: size }}>{titleText}</h3>
      {/* <p>{titleText}</p> */}
    </div>
  );
};

export default Title;
