import React from 'react'

export default ({
  icon, title, action, isActive = null,
}) => (
  <a
    className={`menu-item${isActive && isActive() ? ' is-active' : ''}`}
    onClick={action}
    title={title}
  >
    <svg className="remix">
      <use xlinkHref={`/remixicon.symbol.svg#ri-${icon}`} />
    </svg>
  </a>
)