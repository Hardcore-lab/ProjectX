import React from "react";

function Logo() {
  return (
    <div>
      <a  href="/">
        <img style={{maxHeight: 40, position: "absolute", left: "10%", top: 20}} src="/eve.jpg" alt="eve" />
      </a>
    </div>
  );
}

export default Logo;

export const layout = {
  areaId: "header",
  sortOrder: 5,
};
