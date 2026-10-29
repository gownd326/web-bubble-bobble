'use client'

import React from 'react'

interface VirtualPadProps {
  onChange: (controls: { left: boolean; right: boolean; jump: boolean; shoot: boolean }) => void
}

export default function VirtualPad({ onChange }: VirtualPadProps) {
  const [controls, setControls] = React.useState({
    left: false,
    right: false,
    jump: false,
    shoot: false,
  })

  const update = (key: string, value: boolean) => {
    const next = { ...controls, [key]: value }
    setControls(next)
    onChange(next)
  }

  return (
    <div className="w-full flex items-center justify-between px-4 py-2 bg-[#0f3460] rounded-xl border-2 border-[#e94560] shadow-lg select-none">
      {/* 방향 버튼 (좌우) */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          aria-label="좌측 이동"
          onTouchStart={(e) => { e.preventDefault(); update('left', true) }}
          onTouchEnd={(e) => { e.preventDefault(); update('left', false) }}
          onMouseDown={() => update('left', true)}
          onMouseUp={() => update('left', false)}
          onMouseLeave={() => update('left', false)}
          className={`w-16 h-16 rounded-full font-bold text-2xl flex items-center justify-center transition-transform active:scale-95 ${
            controls.left ? 'bg-[#FF5722] text-white' : 'bg-[#1a1a2e] text-[#FF5722] border-2 border-[#FF5722]'
          }`}
        >
          ◀
        </button>
        <button
          type="button"
          aria-label="우측 이동"
          onTouchStart={(e) => { e.preventDefault(); update('right', true) }}
          onTouchEnd={(e) => { e.preventDefault(); update('right', false) }}
          onMouseDown={() => update('right', true)}
          onMouseUp={() => update('right', false)}
          onMouseLeave={() => update('right', false)}
          className={`w-16 h-16 rounded-full font-bold text-2xl flex items-center justify-center transition-transform active:scale-95 ${
            controls.right ? 'bg-[#FF5722] text-white' : 'bg-[#1a1a2e] text-[#FF5722] border-2 border-[#FF5722]'
          }`}
        >
          ▶
        </button>
      </div>

      {/* 액션 버튼 (점프, 방울) */}
      <div className="flex items-center space-x-4">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-300 mb-1 font-bold">점프</span>
          <button
            type="button"
            aria-label="점프"
            onTouchStart={(e) => { e.preventDefault(); update('jump', true) }}
            onTouchEnd={(e) => { e.preventDefault(); update('jump', false) }}
            onMouseDown={() => update('jump', true)}
            onMouseUp={() => update('jump', false)}
            onMouseLeave={() => update('jump', false)}
            className={`w-16 h-16 rounded-full font-bold text-lg flex items-center justify-center transition-transform active:scale-95 ${
              controls.jump ? 'bg-yellow-500 text-black' : 'bg-[#1a1a2e] text-yellow-400 border-2 border-yellow-400'
            }`}
          >
            ▲
          </button>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-300 mb-1 font-bold">방울</span>
          <button
            type="button"
            aria-label="방울 발사"
            onTouchStart={(e) => { e.preventDefault(); update('shoot', true) }}
            onTouchEnd={(e) => { e.preventDefault(); update('shoot', false) }}
            onMouseDown={() => update('shoot', true)}
            onMouseUp={() => update('shoot', false)}
            onMouseLeave={() => update('shoot', false)}
            className={`w-16 h-16 rounded-full font-bold text-lg flex items-center justify-center transition-transform active:scale-95 ${
              controls.shoot ? 'bg-[#e94560] text-white' : 'bg-[#1a1a2e] text-[#e94560] border-2 border-[#e94560]'
            }`}
          >
            B
          </button>
        </div>
      </div>
    </div>
  )
}
