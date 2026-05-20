import type React from 'react'

export type BlogVisualProps = { compact?: boolean }

export function KdpSpineWidthWrongVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 18)' : undefined}>
      {!compact && (
        <g>
          <rect
            x={116}
            y={46}
            width={184}
            height={36}
            rx={18}
            fill="var(--card)"
            stroke="color-mix(in srgb, var(--primary) 45%, var(--border))"
            strokeWidth={2}
          />
          <text
            x={208}
            y={70}
            textAnchor="middle"
            fill="var(--primary)"
            fontSize={13}
            fontWeight={950}
            letterSpacing={2.2}
          >
            SPINE CHECK
          </text>
          <rect
            x={322}
            y={46}
            width={204}
            height={36}
            rx={18}
            fill="var(--card)"
            stroke="var(--border)"
            strokeWidth={2}
          />
          <text x={424} y={70} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={850}>
            page count + paper
          </text>
        </g>
      )}

      {/* Bleed area */}
      <rect
        x={82}
        y={132}
        width={636}
        height={184}
        rx={28}
        fill="color-mix(in srgb, var(--danger) 5%, transparent)"
        stroke="var(--danger)"
        strokeWidth={2.5}
        strokeDasharray="10 10"
        opacity={0.88}
      />

      {/* Full cover */}
      <rect
        x={112}
        y={164}
        width={576}
        height={122}
        rx={22}
        fill="var(--card)"
        stroke="var(--border)"
        strokeWidth={2.5}
      />
      <path
        d="M134 164h222v122H134a22 22 0 0 1-22-22v-78a22 22 0 0 1 22-22Z"
        fill="color-mix(in srgb, var(--muted) 60%, transparent)"
      />
      <rect
        x={356}
        y={164}
        width={88}
        height={122}
        fill="color-mix(in srgb, var(--primary) 15%, transparent)"
        stroke="color-mix(in srgb, var(--primary) 70%, var(--border))"
        strokeWidth={2.5}
      />
      <path
        d="M444 164h222a22 22 0 0 1 22 22v78a22 22 0 0 1-22 22H444Z"
        fill="color-mix(in srgb, var(--card) 92%, transparent)"
      />

      {/* Safe area */}
      <rect
        x={142}
        y={188}
        width={186}
        height={74}
        rx={14}
        fill="color-mix(in srgb, var(--success) 7%, transparent)"
        stroke="var(--success)"
        strokeWidth={2.4}
        strokeDasharray="8 8"
      />
      <rect
        x={472}
        y={188}
        width={186}
        height={74}
        rx={14}
        fill="color-mix(in srgb, var(--success) 7%, transparent)"
        stroke="var(--success)"
        strokeWidth={2.4}
        strokeDasharray="8 8"
      />
      <rect
        x={378}
        y={190}
        width={44}
        height={70}
        rx={12}
        fill="color-mix(in srgb, var(--success) 6%, transparent)"
        stroke="var(--success)"
        strokeWidth={2.2}
        strokeDasharray="6 7"
      />

      {/* Fold + center guides */}
      <path
        d="M356 160v130M444 160v130"
        stroke="color-mix(in srgb, var(--primary) 75%, var(--border))"
        strokeWidth={2.2}
        strokeDasharray="7 7"
      />
      <path d="M400 164v122" stroke="var(--success)" strokeWidth={3} />

      {/* Labels in solid containers */}
      <rect
        x={200}
        y={210}
        width={70}
        height={30}
        rx={11}
        fill="var(--card)"
        stroke="var(--border)"
        strokeWidth={1.5}
      />
      <text x={235} y={231} textAnchor="middle" fill="var(--foreground)" fontSize={15} fontWeight={900}>
        back
      </text>
      <rect
        x={368}
        y={210}
        width={64}
        height={30}
        rx={11}
        fill="var(--card)"
        stroke="color-mix(in srgb, var(--primary) 52%, var(--border))"
        strokeWidth={1.5}
      />
      <text x={400} y={231} textAnchor="middle" fill="var(--primary)" fontSize={15} fontWeight={950}>
        spine
      </text>
      <rect
        x={530}
        y={210}
        width={70}
        height={30}
        rx={11}
        fill="var(--card)"
        stroke="var(--border)"
        strokeWidth={1.5}
      />
      <text x={565} y={231} textAnchor="middle" fill="var(--foreground)" fontSize={15} fontWeight={900}>
        front
      </text>

      {/* Spine measurement bracket */}
      <path d="M356 136v18M444 136v18M356 145h88" stroke="var(--primary)" strokeWidth={2.8} strokeLinecap="round" />
      <rect
        x={324}
        y={94}
        width={152}
        height={30}
        rx={12}
        fill="var(--card)"
        stroke="color-mix(in srgb, var(--primary) 45%, var(--border))"
        strokeWidth={2}
      />
      <text x={400} y={114} textAnchor="middle" fill="var(--primary)" fontSize={12} fontWeight={950}>
        spine width
      </text>

      {/* Bottom workflow cards */}
      <g transform="translate(96 342)">
        {[
          { x: 0, label: 'page count', tone: 'var(--primary)' },
          { x: 206, label: 'paper type', tone: 'var(--warning)' },
          { x: 412, label: 'full PDF size', tone: 'var(--success)' },
        ].map((item, index) => (
          <g key={item.label}>
            <rect
              x={item.x}
              y={0}
              width={154}
              height={44}
              rx={14}
              fill="var(--card)"
              stroke="var(--border)"
              strokeWidth={1.8}
            />
            <circle cx={item.x + 24} cy={22} r={8} fill={item.tone} opacity={0.9} />
            <text x={item.x + 46} y={27} fill="var(--foreground)" fontSize={12.5} fontWeight={850}>
              {item.label}
            </text>
            {index < 2 && (
              <>
                <path
                  d={`M${item.x + 166} 22h24`}
                  stroke="var(--muted-foreground)"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  opacity={0.7}
                />
                <path
                  d={`M${item.x + 184} 15l8 7-8 7`}
                  fill="none"
                  stroke="var(--muted-foreground)"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.7}
                />
              </>
            )}
          </g>
        ))}
      </g>

      {!compact && (
        <text x={400} y={420} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={800}>
          cover width = bleed + back + spine + front + bleed
        </text>
      )}
    </g>
  )
}

export function SpineTextOffCenterVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 20)' : undefined}>
      <rect x="96" y="104" width="608" height="238" rx="22" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <path
        d="M118 104h246v238H118a22 22 0 0 1-22-22V126a22 22 0 0 1 22-22Z"
        fill="color-mix(in srgb, var(--muted) 68%, transparent)"
      />
      <rect
        x="364"
        y="104"
        width="72"
        height="238"
        fill="color-mix(in srgb, var(--danger) 10%, transparent)"
        stroke="var(--danger)"
        strokeWidth="3"
      />
      <path
        d="M436 104h246a22 22 0 0 1 22 22v194a22 22 0 0 1-22 22H436Z"
        fill="color-mix(in srgb, var(--surface) 76%, transparent)"
      />
      <path d="M400 120v206" stroke="var(--success)" strokeWidth="3" strokeDasharray="7 7" />
      <text
        x="380"
        y="246"
        textAnchor="middle"
        fill="var(--danger)"
        fontSize="15"
        fontWeight="950"
        transform="rotate(-90 380 246)"
      >
        SHIFTED
      </text>
      <path d="M380 148v156" stroke="var(--danger)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="414" cy="124" r="18" fill="var(--card)" stroke="var(--danger)" strokeWidth="3.5" />
      <text x="408" y="133" fill="var(--danger)" fontSize="22" fontWeight="950">
        !
      </text>
      <rect x="132" y="142" width="128" height="20" rx="8" fill="var(--foreground)" opacity=".12" />
      <rect x="500" y="142" width="128" height="20" rx="8" fill="var(--foreground)" opacity=".12" />
      <rect
        x="292"
        y="370"
        width="216"
        height="34"
        rx="11"
        fill="var(--card)"
        stroke="var(--success)"
        strokeWidth="2.5"
      />
      <text x="400" y="393" textAnchor="middle" fill="var(--success)" fontSize="14" fontWeight="950">
        center guide fixes alignment
      </text>
      {!compact && (
        <text x="220" y="62" fill="var(--foreground)" fontSize="22" fontWeight="950">
          KDP spine text alignment
        </text>
      )}
    </g>
  )
}

export function TemplateMismatchVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 18)' : undefined}>
      {!compact && (
        <g>
          <rect
            x={110}
            y={48}
            width={198}
            height={36}
            rx={18}
            fill="var(--card)"
            stroke="var(--danger)"
            strokeWidth={2}
          />
          <text
            x={209}
            y={72}
            textAnchor="middle"
            fill="var(--danger)"
            fontSize={13}
            fontWeight={950}
            letterSpacing={1.8}
          >
            TEMPLATE MISMATCH
          </text>
          <rect
            x={326}
            y={48}
            width={188}
            height={36}
            rx={18}
            fill="var(--card)"
            stroke="var(--border)"
            strokeWidth={2}
          />
          <text x={420} y={72} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={850}>
            PDF size check
          </text>
        </g>
      )}

      {/* Expected template */}
      <rect
        x={86}
        y={118}
        width={628}
        height={204}
        rx={28}
        fill="color-mix(in srgb, var(--success) 5%, transparent)"
        stroke="var(--success)"
        strokeDasharray="10 9"
        strokeWidth={2.7}
      />
      <rect
        x={120}
        y={150}
        width={560}
        height={140}
        rx={22}
        fill="var(--card)"
        stroke="var(--border)"
        strokeWidth={2.5}
      />
      <path
        d="M142 150h218v140H142a22 22 0 0 1-22-22v-96a22 22 0 0 1 22-22Z"
        fill="color-mix(in srgb, var(--muted) 58%, transparent)"
      />
      <rect
        x={360}
        y={150}
        width={80}
        height={140}
        fill="color-mix(in srgb, var(--primary) 15%, transparent)"
        stroke="color-mix(in srgb, var(--primary) 70%, var(--border))"
        strokeWidth={2.5}
      />
      <path
        d="M440 150h218a22 22 0 0 1 22 22v96a22 22 0 0 1-22 22H440Z"
        fill="color-mix(in srgb, var(--card) 92%, transparent)"
      />

      {/* Wrong exported PDF overlay */}
      <rect
        x={148}
        y={174}
        width={470}
        height={92}
        rx={16}
        fill="color-mix(in srgb, var(--danger) 9%, transparent)"
        stroke="var(--danger)"
        strokeDasharray="9 8"
        strokeWidth={3}
      />
      <rect x={274} y={196} width={252} height={44} rx={13} fill="var(--card)" stroke="var(--danger)" strokeWidth={2} />
      <text x={400} y={224} textAnchor="middle" fill="var(--danger)" fontSize={15} fontWeight={950}>
        exported PDF is smaller
      </text>

      {/* Panel labels */}
      <rect
        x={202}
        y={112}
        width={72}
        height={30}
        rx={11}
        fill="var(--card)"
        stroke="var(--border)"
        strokeWidth={1.5}
      />
      <text x={238} y={133} textAnchor="middle" fill="var(--foreground)" fontSize={14} fontWeight={900}>
        back
      </text>
      <rect
        x={368}
        y={112}
        width={64}
        height={30}
        rx={11}
        fill="var(--card)"
        stroke="color-mix(in srgb, var(--primary) 52%, var(--border))"
        strokeWidth={1.5}
      />
      <text x={400} y={133} textAnchor="middle" fill="var(--primary)" fontSize={14} fontWeight={950}>
        spine
      </text>
      <rect
        x={526}
        y={112}
        width={72}
        height={30}
        rx={11}
        fill="var(--card)"
        stroke="var(--border)"
        strokeWidth={1.5}
      />
      <text x={562} y={133} textAnchor="middle" fill="var(--foreground)" fontSize={14} fontWeight={900}>
        front
      </text>

      {/* Measurement indicators */}
      <path d="M86 344v18M714 344v18M86 353h628" stroke="var(--success)" strokeWidth={3} strokeLinecap="round" />
      <path d="M148 382v18M618 382v18M148 391h470" stroke="var(--danger)" strokeWidth={3} strokeLinecap="round" />
      <rect
        x={248}
        y={332}
        width={304}
        height={32}
        rx={12}
        fill="var(--card)"
        stroke="color-mix(in srgb, var(--success) 45%, var(--border))"
        strokeWidth={2}
      />
      <text x={400} y={354} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950}>
        expected full template width
      </text>
      <rect
        x={274}
        y={374}
        width={252}
        height={32}
        rx={12}
        fill="var(--card)"
        stroke="color-mix(in srgb, var(--danger) 45%, var(--border))"
        strokeWidth={2}
      />
      <text x={400} y={396} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950}>
        actual PDF page box
      </text>

      {!compact && (
        <text x={400} y={432} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12.5} fontWeight={800}>
          trim size + bleed + spine width must match the template
        </text>
      )}
    </g>
  )
}

export function ColoringBookBleedDecisionVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 18)' : undefined}>
      {!compact && (
        <g>
          <rect
            x={112}
            y={48}
            width={172}
            height={36}
            rx={18}
            fill="var(--card)"
            stroke="color-mix(in srgb, var(--primary) 45%, var(--border))"
            strokeWidth={2}
          />
          <text
            x={198}
            y={72}
            textAnchor="middle"
            fill="var(--primary)"
            fontSize={13}
            fontWeight={950}
            letterSpacing={1.8}
          >
            BLEED DECISION
          </text>
          <rect
            x={302}
            y={48}
            width={198}
            height={36}
            rx={18}
            fill="var(--card)"
            stroke="var(--border)"
            strokeWidth={2}
          />
          <text x={401} y={72} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={850}>
            coloring book pages
          </text>
        </g>
      )}

      {/* No bleed page */}
      <g transform="translate(104 112)">
        <rect
          x={0}
          y={0}
          width={248}
          height={270}
          rx={22}
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth={2.5}
        />
        <rect
          x={28}
          y={32}
          width={192}
          height={206}
          rx={18}
          fill="color-mix(in srgb, var(--success) 7%, transparent)"
          stroke="var(--success)"
          strokeWidth={2.5}
          strokeDasharray="8 8"
        />
        <circle cx={124} cy={132} r={52} fill="none" stroke="var(--foreground)" strokeWidth={4} opacity={0.78} />
        <circle cx={124} cy={132} r={30} fill="none" stroke="var(--foreground)" strokeWidth={3} opacity={0.52} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180
          const x1 = 124 + Math.cos(rad) * 20
          const y1 = 132 + Math.sin(rad) * 20
          const x2 = 124 + Math.cos(rad) * 62
          const y2 = 132 + Math.sin(rad) * 62
          return (
            <path
              key={angle}
              d={`M${x1} ${y1}L${x2} ${y2}`}
              stroke="var(--foreground)"
              strokeWidth={2.2}
              opacity={0.5}
              strokeLinecap="round"
            />
          )
        })}
        <rect
          x={50}
          y={244}
          width={148}
          height={34}
          rx={13}
          fill="var(--card)"
          stroke="color-mix(in srgb, var(--success) 52%, var(--border))"
          strokeWidth={2}
        />
        <text x={124} y={267} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950}>
          NO BLEED
        </text>
      </g>

      {/* Bleed page */}
      <g transform="translate(448 94)">
        <rect
          x={-22}
          y={0}
          width={292}
          height={306}
          rx={28}
          fill="color-mix(in srgb, var(--danger) 6%, transparent)"
          stroke="var(--danger)"
          strokeWidth={2.5}
          strokeDasharray="10 9"
        />
        <rect
          x={0}
          y={24}
          width={248}
          height={270}
          rx={22}
          fill="color-mix(in srgb, var(--primary) 12%, var(--card))"
          stroke="var(--border)"
          strokeWidth={2.5}
        />
        <path
          d="M0 88c42-38 75-40 119 0s87 36 129-4v210H0Z"
          fill="color-mix(in srgb, var(--primary) 24%, transparent)"
        />
        <path
          d="M-10 100c46-42 88-46 134 0s88 40 134-4"
          fill="none"
          stroke="var(--foreground)"
          strokeWidth={4}
          opacity={0.52}
          strokeLinecap="round"
        />
        <rect
          x={32}
          y={56}
          width={184}
          height={184}
          rx={16}
          fill="transparent"
          stroke="var(--success)"
          strokeDasharray="8 8"
          strokeWidth={2.5}
        />
        <rect
          x={50}
          y={256}
          width={148}
          height={34}
          rx={13}
          fill="var(--card)"
          stroke="color-mix(in srgb, var(--danger) 48%, var(--border))"
          strokeWidth={2}
        />
        <text x={124} y={279} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950}>
          BLEED
        </text>
      </g>

      {/* Decision arrow */}
      <path d="M376 234h48" stroke="var(--muted-foreground)" strokeWidth={3} strokeLinecap="round" opacity={0.72} />
      <path
        d="M416 224l12 10-12 10"
        fill="none"
        stroke="var(--muted-foreground)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.72}
      />
      <rect x={322} y={184} width={156} height={38} rx={14} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={400} y={209} textAnchor="middle" fill="var(--foreground)" fontSize={13} fontWeight={900}>
        edge artwork?
      </text>

      {!compact && (
        <g transform="translate(174 414)">
          <line x1={0} y1={0} x2={32} y2={0} stroke="var(--danger)" strokeWidth={2.5} strokeDasharray="8 7" />
          <text x={44} y={5} fill="var(--muted-foreground)" fontSize={12.5} fontWeight={800}>
            bleed extension
          </text>
          <line x1={208} y1={0} x2={240} y2={0} stroke="var(--success)" strokeWidth={2.5} strokeDasharray="8 7" />
          <text x={252} y={5} fill="var(--muted-foreground)" fontSize={12.5} fontWeight={800}>
            safe margin
          </text>
        </g>
      )}
    </g>
  )
}

export function LowContentBookVisual({ compact = false }: { compact?: boolean }) {
  const dy = compact ? 20 : 0
  const tileY = 118 + dy
  const tiles = [
    { x: 84, label: 'Journal', sub: 'lined pages', tone: 'var(--primary)' },
    { x: 250, label: 'Planner', sub: 'templates', tone: 'var(--success)' },
    { x: 416, label: 'Coloring', sub: 'activity pages', tone: 'var(--warning)' },
    { x: 582, label: 'Puzzle', sub: 'solve + fill', tone: 'var(--danger)' },
  ]

  return (
    <g>
      {!compact && (
        <g>
          <rect
            x={92}
            y={46}
            width={190}
            height={36}
            rx={18}
            fill="var(--card)"
            stroke="color-mix(in srgb, var(--primary) 45%, var(--border))"
            strokeWidth={2}
          />
          <text
            x={187}
            y={70}
            textAnchor="middle"
            fill="var(--primary)"
            fontSize={13}
            fontWeight={950}
            letterSpacing={1.7}
          >
            LOW CONTENT
          </text>
          <rect
            x={302}
            y={46}
            width={244}
            height={36}
            rx={18}
            fill="var(--card)"
            stroke="var(--border)"
            strokeWidth={2}
          />
          <text x={424} y={70} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={850}>
            classification guide
          </text>
        </g>
      )}

      {/* Classification cards */}
      {tiles.map((tile, index) => (
        <g key={tile.label}>
          <rect
            x={tile.x}
            y={tileY}
            width={118}
            height={146}
            rx={20}
            fill="var(--card)"
            stroke="var(--border)"
            strokeWidth={2}
          />
          <rect
            x={tile.x + 18}
            y={tileY + 22}
            width={82}
            height={78}
            rx={12}
            fill={`color-mix(in srgb, ${tile.tone} 9%, transparent)`}
            stroke={tile.tone}
            strokeWidth={2}
          />
          {index === 0 && (
            <>
              {[0, 1, 2, 3].map((line) => (
                <line
                  key={line}
                  x1={tile.x + 34}
                  y1={tileY + 46 + line * 14}
                  x2={tile.x + 84}
                  y2={tileY + 46 + line * 14}
                  stroke="var(--foreground)"
                  strokeWidth={2}
                  opacity={0.2}
                />
              ))}
            </>
          )}
          {index === 1 && (
            <>
              <rect
                x={tile.x + 34}
                y={tileY + 42}
                width={20}
                height={18}
                rx={4}
                fill="transparent"
                stroke="var(--foreground)"
                strokeWidth={2}
                opacity={0.25}
              />
              <rect
                x={tile.x + 64}
                y={tileY + 42}
                width={20}
                height={18}
                rx={4}
                fill="transparent"
                stroke="var(--foreground)"
                strokeWidth={2}
                opacity={0.25}
              />
              <rect
                x={tile.x + 34}
                y={tileY + 70}
                width={50}
                height={14}
                rx={4}
                fill="var(--foreground)"
                opacity={0.18}
              />
            </>
          )}
          {index === 2 && (
            <>
              <circle
                cx={tile.x + 59}
                cy={tileY + 61}
                r={24}
                fill="none"
                stroke="var(--foreground)"
                strokeWidth={3}
                opacity={0.28}
              />
              <path
                d={`M${tile.x + 38} ${tileY + 79}c14-24 32-24 44 0`}
                fill="none"
                stroke="var(--foreground)"
                strokeWidth={2.5}
                opacity={0.24}
                strokeLinecap="round"
              />
            </>
          )}
          {index === 3 && (
            <>
              <rect
                x={tile.x + 36}
                y={tileY + 42}
                width={46}
                height={46}
                rx={6}
                fill="none"
                stroke="var(--foreground)"
                strokeWidth={2.2}
                opacity={0.24}
              />
              <path
                d={`M${tile.x + 59} ${tileY + 42}v46M${tile.x + 36} ${tileY + 65}h46`}
                stroke="var(--foreground)"
                strokeWidth={2}
                opacity={0.2}
              />
            </>
          )}
          <text
            x={tile.x + 59}
            y={tileY + 120}
            textAnchor="middle"
            fill="var(--foreground)"
            fontSize={12}
            fontWeight={950}
          >
            {tile.label}
          </text>
          <text
            x={tile.x + 59}
            y={tileY + 135}
            textAnchor="middle"
            fill="var(--muted-foreground)"
            fontSize={9.5}
            fontWeight={800}
          >
            {tile.sub}
          </text>
        </g>
      ))}

      {/* Rule strip */}
      <rect
        x={136}
        y={302 + dy}
        width={528}
        height={68}
        rx={22}
        fill="color-mix(in srgb, var(--primary) 7%, var(--card))"
        stroke="color-mix(in srgb, var(--primary) 38%, var(--border))"
        strokeWidth={2.5}
      />
      <rect
        x={166}
        y={320 + dy}
        width={138}
        height={32}
        rx={12}
        fill="var(--card)"
        stroke="var(--danger)"
        strokeWidth={2}
      />
      <text x={235} y={342 + dy} textAnchor="middle" fill="var(--danger)" fontSize={12} fontWeight={950}>
        free ISBN: no
      </text>
      <rect
        x={330}
        y={320 + dy}
        width={146}
        height={32}
        rx={12}
        fill="var(--card)"
        stroke="var(--primary)"
        strokeWidth={2}
      />
      <text x={403} y={342 + dy} textAnchor="middle" fill="var(--primary)" fontSize={12} fontWeight={950}>
        not a penalty
      </text>
      <rect
        x={502}
        y={320 + dy}
        width={132}
        height={32}
        rx={12}
        fill="var(--card)"
        stroke="var(--success)"
        strokeWidth={2}
      />
      <text x={568} y={342 + dy} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={950}>
        print checks
      </text>

      {/* Bottom production signals */}
      {!compact && (
        <g transform="translate(162 404)">
          {[
            { label: 'metadata', color: 'var(--primary)' },
            { label: 'bleed', color: 'var(--danger)' },
            { label: 'safe margins', color: 'var(--success)' },
            { label: 'proof copy', color: 'var(--warning)' },
          ].map((item, index) => (
            <g key={item.label} transform={`translate(${index * 126} 0)`}>
              <circle cx={9} cy={0} r={6} fill={item.color} opacity={0.9} />
              <text x={22} y={5} fill="var(--muted-foreground)" fontSize={11.5} fontWeight={800}>
                {item.label}
              </text>
            </g>
          ))}
        </g>
      )}
    </g>
  )
}

export function CheapProofCopyVisual({ compact = false }: { compact?: boolean }) {
  const dy = compact ? 20 : 0
  const callouts = [
    { x: 74, y: 134 + dy, w: 134, label: 'dull colors', color: 'var(--danger)' },
    { x: 80, y: 230 + dy, w: 142, label: 'border shift', color: 'var(--warning)' },
    { x: 560, y: 146 + dy, w: 146, label: 'gray blacks', color: 'var(--danger)' },
    { x: 558, y: 256 + dy, w: 150, label: 'blurry artwork', color: 'var(--primary)' },
  ]

  return (
    <g>
      {!compact && (
        <g>
          <rect x={104} y={46} width={178} height={36} rx={18} fill="var(--card)" stroke="color-mix(in srgb, var(--danger) 45%, var(--border))" strokeWidth={2} />
          <text x={193} y={70} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950} letterSpacing={1.6}>PROOF COPY</text>
          <rect x={302} y={46} width={226} height={36} rx={18} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
          <text x={415} y={70} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={850}>print risk diagnosis</text>
        </g>
      )}

      <g transform={`translate(222 ${104 + dy})`}>
        <path d="M40 26h244c18 0 32 14 32 32v216c0 18-14 32-32 32H40c-18 0-32-14-32-32V58c0-18 14-32 32-32Z" fill="var(--card)" stroke="var(--border)" strokeWidth={3} />
        <path d="M40 26h118v306H40c-18 0-32-14-32-32V58c0-18 14-32 32-32Z" fill="color-mix(in srgb, var(--foreground) 7%, transparent)" />
        <path d="M158 32v296" stroke="var(--border)" strokeWidth={3} />
        <path d="M174 26h110c18 0 32 14 32 32v216c0 18-14 32-32 32H174Z" fill="color-mix(in srgb, var(--primary) 8%, var(--card))" />
        <rect x={198} y={62} width={90} height={28} rx={7} fill="var(--foreground)" opacity={0.58} />
        <text x={243} y={81} textAnchor="middle" fill="var(--card)" fontSize={12} fontWeight={950}>TITLE</text>
        <rect x={206} y={112} width={72} height={8} rx={4} fill="var(--muted-foreground)" opacity={0.28} />
        <rect x={190} y={252} width={104} height={34} rx={10} fill="transparent" stroke="var(--danger)" strokeWidth={2.4} />
        <path d="M174 28h110" stroke="var(--danger)" strokeWidth={3} strokeDasharray="8 7" opacity={0.75} />
      </g>

      {callouts.map((item) => (
        <g key={item.label}>
          <rect x={item.x} y={item.y} width={item.w} height={34} rx={12} fill="var(--card)" stroke={item.color} strokeWidth={2} />
          <circle cx={item.x + 18} cy={item.y + 17} r={8} fill={item.color} opacity={0.85} />
          <text x={item.x + 34} y={item.y + 22} fill="var(--foreground)" fontSize={12} fontWeight={900}>{item.label}</text>
        </g>
      ))}

      {!compact && (
        <>
          <rect x={164} y={408} width={472} height={32} rx={12} fill="color-mix(in srgb, var(--success) 8%, var(--card))" stroke="var(--success)" strokeWidth={2} />
          <text x={400} y={429} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={900}>fix the print workflow, then order another proof</text>
        </>
      )}
    </g>
  )
}

export function DarkColoringBookVisual({ compact = false }: { compact?: boolean }) {
  const dy = compact ? 20 : 0
  return (
    <g>
      {!compact && (
        <g>
          <rect x={96} y={46} width={198} height={36} rx={18} fill="var(--card)" stroke="color-mix(in srgb, var(--danger) 45%, var(--border))" strokeWidth={2} />
          <text x={195} y={70} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950} letterSpacing={1.5}>DARK PRINT</text>
          <rect x={314} y={46} width={252} height={36} rx={18} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
          <text x={440} y={70} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={850}>coloring book contrast</text>
        </g>
      )}

      <g transform={`translate(104 ${112 + dy})`}>
        <rect x={0} y={0} width={248} height={276} rx={22} fill="var(--card)" stroke="var(--danger)" strokeWidth={2.5} />
        <rect x={34} y={34} width={180} height={196} rx={14} fill="color-mix(in srgb, var(--foreground) 78%, var(--card))" />
        <circle cx={124} cy={126} r={56} fill="none" stroke="var(--card)" strokeWidth={3} opacity={0.3} />
        <path d="M76 190c28-60 72-60 96 0" fill="none" stroke="var(--card)" strokeWidth={3} opacity={0.24} />
        <text x={82} y={112} fill="var(--card)" fontSize={10} fontWeight={950} opacity={0.32}>12</text>
        <text x={158} y={178} fill="var(--card)" fontSize={10} fontWeight={950} opacity={0.28}>48</text>
        <rect x={52} y={242} width={144} height={30} rx={11} fill="color-mix(in srgb, var(--danger) 9%, var(--card))" stroke="var(--danger)" strokeWidth={2} />
        <text x={124} y={262} textAnchor="middle" fill="var(--danger)" fontSize={12} fontWeight={950}>muddy proof</text>
      </g>

      <g transform={`translate(448 ${112 + dy})`}>
        <rect x={0} y={0} width={248} height={276} rx={22} fill="var(--card)" stroke="var(--success)" strokeWidth={2.5} />
        <rect x={34} y={34} width={180} height={196} rx={14} fill="color-mix(in srgb, var(--foreground) 62%, var(--card))" />
        <circle cx={124} cy={126} r={56} fill="none" stroke="var(--card)" strokeWidth={4} opacity={0.62} />
        <path d="M76 190c28-60 72-60 96 0" fill="none" stroke="var(--card)" strokeWidth={4} opacity={0.55} />
        <text x={82} y={112} fill="var(--card)" fontSize={15} fontWeight={950} opacity={0.82}>12</text>
        <text x={158} y={178} fill="var(--card)" fontSize={15} fontWeight={950} opacity={0.78}>48</text>
        <rect x={52} y={242} width={144} height={30} rx={11} fill="color-mix(in srgb, var(--success) 9%, var(--card))" stroke="var(--success)" strokeWidth={2} />
        <text x={124} y={262} textAnchor="middle" fill="var(--success)" fontSize={12} fontWeight={950}>print-safe</text>
      </g>

      <rect x={336} y={226 + dy} width={128} height={42} rx={14} fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={400} y={243 + dy} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10} fontWeight={850}>fix</text>
      <text x={400} y={261 + dy} textAnchor="middle" fill="var(--foreground)" fontSize={12} fontWeight={950}>contrast</text>

      {!compact && (
        <text x={400} y={426} textAnchor="middle" fill="var(--muted-foreground)" fontSize={12.5} fontWeight={800}>numbers and line art must survive paper absorption</text>
      )}
    </g>
  )
}

export function ScreenPrintMismatchVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 18)' : undefined}>
      {!compact && (
        <g>
          <rect
            x={118}
            y={48}
            width={164}
            height={36}
            rx={18}
            fill="var(--card)"
            stroke="color-mix(in srgb, var(--primary) 45%, var(--border))"
            strokeWidth={2}
          />
          <text
            x={200}
            y={72}
            textAnchor="middle"
            fill="var(--primary)"
            fontSize={13}
            fontWeight={950}
            letterSpacing={1.6}
          >
            PDF PREVIEW
          </text>
          <rect
            x={302}
            y={48}
            width={176}
            height={36}
            rx={18}
            fill="var(--card)"
            stroke="var(--border)"
            strokeWidth={2}
          />
          <text x={390} y={72} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={850}>
            physical proof
          </text>
        </g>
      )}

      {/* Screen preview */}
      <g transform="translate(84 116)">
        <rect
          x={0}
          y={0}
          width={282}
          height={190}
          rx={24}
          fill="color-mix(in srgb, var(--foreground) 88%, var(--card))"
          stroke="var(--border)"
          strokeWidth={2.5}
        />
        <rect
          x={18}
          y={18}
          width={246}
          height={138}
          rx={14}
          fill="color-mix(in srgb, var(--primary) 25%, var(--card))"
        />
        <rect x={44} y={42} width={194} height={40} rx={12} fill="var(--card)" opacity={0.94} />
        <text x={141} y={68} textAnchor="middle" fill="var(--foreground)" fontSize={17} fontWeight={950}>
          looks perfect
        </text>
        <rect x={68} y={104} width={146} height={18} rx={9} fill="var(--success)" opacity={0.85} />
        <rect x={92} y={132} width={98} height={12} rx={6} fill="var(--card)" opacity={0.55} />
        <path d="M82 190h118" stroke="var(--foreground)" strokeWidth={8} strokeLinecap="round" opacity={0.18} />
        <rect x={92} y={205} width={98} height={18} rx={9} fill="var(--foreground)" opacity={0.16} />
        <rect
          x={74}
          y={236}
          width={134}
          height={34}
          rx={13}
          fill="var(--card)"
          stroke="color-mix(in srgb, var(--success) 45%, var(--border))"
          strokeWidth={2}
        />
        <text x={141} y={259} textAnchor="middle" fill="var(--success)" fontSize={13} fontWeight={950}>
          screen light
        </text>
      </g>

      {/* Print proof */}
      <g transform="translate(458 104)">
        <rect
          x={0}
          y={0}
          width={230}
          height={286}
          rx={20}
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth={2.5}
        />
        <rect
          x={20}
          y={24}
          width={190}
          height={238}
          rx={14}
          fill="color-mix(in srgb, var(--muted) 36%, var(--card))"
          stroke="color-mix(in srgb, var(--foreground) 8%, var(--border))"
          strokeWidth={1.5}
        />
        <rect
          x={45}
          y={54}
          width={140}
          height={36}
          rx={11}
          fill="color-mix(in srgb, var(--foreground) 62%, var(--card))"
          opacity={0.72}
        />
        <text x={115} y={78} textAnchor="middle" fill="var(--card)" fontSize={16} fontWeight={950}>
          printed softer
        </text>
        <rect
          x={64}
          y={112}
          width={102}
          height={16}
          rx={8}
          fill="color-mix(in srgb, var(--success) 55%, var(--muted))"
          opacity={0.7}
        />
        <rect x={78} y={142} width={74} height={10} rx={5} fill="var(--foreground)" opacity={0.2} />
        <rect
          x={20}
          y={24}
          width={190}
          height={238}
          rx={14}
          fill="none"
          stroke="var(--danger)"
          strokeWidth={2.4}
          strokeDasharray="9 8"
          opacity={0.82}
        />
        <rect
          x={50}
          y={274}
          width={130}
          height={34}
          rx={13}
          fill="var(--card)"
          stroke="color-mix(in srgb, var(--danger) 45%, var(--border))"
          strokeWidth={2}
        />
        <text x={115} y={297} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950}>
          ink + paper
        </text>
      </g>

      {/* Center warning */}
      <circle cx={410} cy={220} r={30} fill="var(--card)" stroke="var(--warning)" strokeWidth={3} />
      <text x={410} y={229} textAnchor="middle" fill="var(--warning)" fontSize={25} fontWeight={950}>
        ≠
      </text>
      <path d="M372 220h-24" stroke="var(--warning)" strokeWidth={3} strokeLinecap="round" opacity={0.55} />
      <path d="M448 220h24" stroke="var(--warning)" strokeWidth={3} strokeLinecap="round" opacity={0.55} />

      {!compact && (
        <g transform="translate(154 408)">
          {[
            { x: 0, label: 'color', tone: 'var(--primary)' },
            { x: 152, label: 'trim', tone: 'var(--danger)' },
            { x: 304, label: '300 DPI', tone: 'var(--success)' },
          ].map((item) => (
            <g key={item.label}>
              <rect
                x={item.x}
                y={0}
                width={118}
                height={34}
                rx={13}
                fill="var(--card)"
                stroke="var(--border)"
                strokeWidth={1.7}
              />
              <circle cx={item.x + 22} cy={17} r={7} fill={item.tone} opacity={0.9} />
              <text x={item.x + 40} y={22} fill="var(--foreground)" fontSize={12.5} fontWeight={850}>
                {item.label}
              </text>
            </g>
          ))}
        </g>
      )}
    </g>
  )
}

export function CanvaToKdpExportVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 18)' : undefined}>
      {!compact && (
        <g>
          <rect
            x={112}
            y={48}
            width={172}
            height={36}
            rx={18}
            fill="var(--card)"
            stroke="color-mix(in srgb, var(--primary) 45%, var(--border))"
            strokeWidth={2}
          />
          <text
            x={198}
            y={72}
            textAnchor="middle"
            fill="var(--primary)"
            fontSize={13}
            fontWeight={950}
            letterSpacing={1.6}
          >
            CANVA EXPORT
          </text>
          <rect
            x={304}
            y={48}
            width={186}
            height={36}
            rx={18}
            fill="var(--card)"
            stroke="var(--border)"
            strokeWidth={2}
          />
          <text x={397} y={72} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={850}>
            KDP print-ready PDF
          </text>
        </g>
      )}

      {/* Canva export panel */}
      <g transform="translate(92 112)">
        <rect
          x={0}
          y={0}
          width={286}
          height={250}
          rx={24}
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth={2.5}
        />
        <rect x={0} y={0} width={286} height={54} rx={24} fill="color-mix(in srgb, var(--primary) 11%, transparent)" />
        <text x={24} y={34} fill="var(--foreground)" fontSize={16} fontWeight={950}>
          Download settings
        </text>
        <rect
          x={24}
          y={78}
          width={238}
          height={42}
          rx={13}
          fill="color-mix(in srgb, var(--success) 9%, transparent)"
          stroke="var(--success)"
          strokeWidth={2}
        />
        <text x={44} y={105} fill="var(--success)" fontSize={14} fontWeight={950}>
          PDF Print
        </text>
        <rect x={196} y={90} width={42} height={18} rx={9} fill="var(--success)" opacity={0.85} />
        <circle cx={229} cy={99} r={7} fill="var(--card)" />
        <rect
          x={24}
          y={136}
          width={238}
          height={34}
          rx={12}
          fill="color-mix(in srgb, var(--primary) 7%, transparent)"
          stroke="var(--border)"
          strokeWidth={1.7}
        />
        <circle cx={43} cy={153} r={7} fill="var(--primary)" opacity={0.85} />
        <text x={60} y={158} fill="var(--foreground)" fontSize={13} fontWeight={850}>
          Bleed when needed
        </text>
        <rect
          x={24}
          y={184}
          width={238}
          height={34}
          rx={12}
          fill="color-mix(in srgb, var(--danger) 6%, transparent)"
          stroke="var(--border)"
          strokeWidth={1.7}
        />
        <circle cx={43} cy={201} r={7} fill="var(--danger)" opacity={0.85} />
        <text x={60} y={206} fill="var(--foreground)" fontSize={13} fontWeight={850}>
          Crop marks off
        </text>
      </g>

      {/* Arrow */}
      <path d="M400 236h60" stroke="var(--muted-foreground)" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
      <path
        d="M452 226l12 10-12 10"
        fill="none"
        stroke="var(--muted-foreground)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />

      {/* KDP validation panel */}
      <g transform="translate(488 112)">
        <rect
          x={0}
          y={0}
          width={220}
          height={250}
          rx={24}
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth={2.5}
        />
        <text x={24} y={34} fill="var(--foreground)" fontSize={16} fontWeight={950}>
          KDP checks
        </text>
        {[
          { y: 66, label: 'dimensions', tone: 'var(--success)' },
          { y: 112, label: 'bleed', tone: 'var(--success)' },
          { y: 158, label: '300 DPI', tone: 'var(--warning)' },
          { y: 204, label: 'spine width', tone: 'var(--primary)' },
        ].map((item) => (
          <g key={item.label}>
            <rect
              x={22}
              y={item.y}
              width={176}
              height={32}
              rx={11}
              fill="color-mix(in srgb, var(--muted) 18%, transparent)"
              stroke="var(--border)"
              strokeWidth={1.5}
            />
            <circle cx={40} cy={item.y + 16} r={8} fill={item.tone} opacity={0.9} />
            <path
              d={`M35 ${item.y + 16}l4 4 7-9`}
              fill="none"
              stroke="var(--card)"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text x={58} y={item.y + 21} fill="var(--foreground)" fontSize={12.5} fontWeight={850}>
              {item.label}
            </text>
          </g>
        ))}
      </g>

      {!compact && (
        <g transform="translate(168 406)">
          <rect
            x={0}
            y={0}
            width={464}
            height={34}
            rx={13}
            fill="var(--card)"
            stroke="color-mix(in srgb, var(--primary) 34%, var(--border))"
            strokeWidth={1.8}
          />
          <text x={232} y={23} textAnchor="middle" fill="var(--foreground)" fontSize={12.5} fontWeight={850}>
            exact size → PDF Print → verify exported PDF → upload
          </text>
        </g>
      )}
    </g>
  )
}

export function SafeAreaCheckerVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 20)' : undefined}>
      <rect
        x="112"
        y="68"
        width="576"
        height="318"
        rx="24"
        fill="color-mix(in srgb, var(--danger) 8%, transparent)"
        stroke="var(--danger)"
        strokeDasharray="9 9"
        strokeWidth="3"
      />
      <rect
        x="154"
        y="102"
        width="492"
        height="252"
        rx="20"
        fill="var(--card)"
        stroke="var(--primary)"
        strokeWidth="3"
      />
      <rect
        x="216"
        y="150"
        width="368"
        height="156"
        rx="16"
        fill="color-mix(in srgb, var(--success) 10%, transparent)"
        stroke="var(--success)"
        strokeDasharray="8 8"
        strokeWidth="3"
      />
      <rect x="276" y="184" width="248" height="42" rx="12" fill="var(--foreground)" opacity=".86" />
      <text x="400" y="212" textAnchor="middle" fill="var(--card)" fontSize="19" fontWeight="950">
        SAFE TITLE
      </text>
      <rect x="318" y="246" width="164" height="18" rx="9" fill="var(--primary)" opacity=".62" />
      <rect x="344" y="282" width="112" height="14" rx="7" fill="var(--foreground)" opacity=".35" />
      <rect
        x="538"
        y="306"
        width="78"
        height="28"
        rx="9"
        fill="color-mix(in srgb, var(--danger) 12%, transparent)"
        stroke="var(--danger)"
        strokeWidth="2.5"
      />
      <text x="577" y="325" textAnchor="middle" fill="var(--danger)" fontSize="12" fontWeight="950">
        too low
      </text>
      <path d="M624 320h40" stroke="var(--danger)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="646" cy="102" r="25" fill="var(--card)" stroke="var(--success)" strokeWidth="4" />
      <path
        d="M634 101l9 9 18-21"
        fill="none"
        stroke="var(--success)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="70"
        y="138"
        width="116"
        height="34"
        rx="11"
        fill="var(--card)"
        stroke="var(--danger)"
        strokeWidth="2.5"
      />
      <text x="128" y="161" textAnchor="middle" fill="var(--danger)" fontSize="14" fontWeight="950">
        bleed
      </text>
      <rect
        x="94"
        y="194"
        width="92"
        height="34"
        rx="11"
        fill="var(--card)"
        stroke="var(--primary)"
        strokeWidth="2.5"
      />
      <text x="140" y="217" textAnchor="middle" fill="var(--primary)" fontSize="14" fontWeight="950">
        trim
      </text>
      <rect
        x="82"
        y="250"
        width="126"
        height="34"
        rx="11"
        fill="var(--card)"
        stroke="var(--success)"
        strokeWidth="2.5"
      />
      <text x="145" y="273" textAnchor="middle" fill="var(--success)" fontSize="14" fontWeight="950">
        safe area
      </text>
      {!compact && (
        <text x="228" y="48" fill="var(--foreground)" fontSize="21" fontWeight="950">
          pre-export safe-area check
        </text>
      )}
    </g>
  )
}

export function BackgroundBleedVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 22)' : undefined}>
      <rect
        x="120"
        y="70"
        width="560"
        height="320"
        rx="24"
        fill="color-mix(in srgb, var(--primary) 18%, transparent)"
        stroke="var(--danger)"
        strokeDasharray="9 9"
        strokeWidth="3"
      />
      <rect
        x="166"
        y="112"
        width="468"
        height="236"
        rx="20"
        fill="color-mix(in srgb, var(--primary) 22%, transparent)"
        stroke="var(--primary)"
        strokeWidth="3"
      />
      <rect
        x="244"
        y="168"
        width="312"
        height="118"
        rx="16"
        fill="var(--card)"
        stroke="var(--success)"
        strokeDasharray="8 8"
        strokeWidth="3"
      />
      <rect x="300" y="196" width="200" height="38" rx="11" fill="var(--foreground)" opacity=".82" />
      <text x="400" y="221" textAnchor="middle" fill="var(--card)" fontSize="17" fontWeight="950">
        BACKGROUND
      </text>
      <rect x="336" y="254" width="128" height="16" rx="8" fill="var(--primary)" opacity=".62" />
      <rect x="80" y="120" width="108" height="36" rx="11" fill="var(--card)" stroke="var(--danger)" strokeWidth="3" />
      <text x="134" y="144" textAnchor="middle" fill="var(--danger)" fontSize="15" fontWeight="950">
        bleed
      </text>
      <rect
        x="622"
        y="132"
        width="96"
        height="34"
        rx="10"
        fill="var(--card)"
        stroke="var(--primary)"
        strokeWidth="2.5"
      />
      <text x="670" y="155" textAnchor="middle" fill="var(--primary)" fontSize="14" fontWeight="950">
        trim
      </text>
      <circle cx="638" cy="338" r="25" fill="var(--card)" stroke="var(--success)" strokeWidth="4" />
      <path
        d="M626 337l9 9 17-21"
        fill="none"
        stroke="var(--success)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {!compact && (
        <text x="220" y="54" fill="var(--foreground)" fontSize="19" fontWeight="950">
          background extends past trim
        </text>
      )}
    </g>
  )
}

export function SafeMarginCoverVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 20)' : undefined}>
      <rect
        x="126"
        y="72"
        width="548"
        height="318"
        rx="24"
        fill="color-mix(in srgb, var(--danger) 8%, transparent)"
        stroke="var(--danger)"
        strokeDasharray="9 9"
        strokeWidth="3"
      />
      <rect
        x="164"
        y="104"
        width="472"
        height="254"
        rx="20"
        fill="var(--card)"
        stroke="var(--primary)"
        strokeWidth="3"
      />
      <rect
        x="228"
        y="154"
        width="344"
        height="154"
        rx="16"
        fill="color-mix(in srgb, var(--success) 10%, transparent)"
        stroke="var(--success)"
        strokeDasharray="8 8"
        strokeWidth="3"
      />
      <rect x="272" y="184" width="256" height="44" rx="12" fill="var(--foreground)" opacity=".84" />
      <text x="400" y="213" textAnchor="middle" fill="var(--card)" fontSize="20" fontWeight="950">
        SAFE TITLE
      </text>
      <rect x="320" y="252" width="160" height="18" rx="8" fill="var(--primary)" opacity=".62" />
      <rect x="348" y="292" width="104" height="16" rx="8" fill="var(--foreground)" opacity=".35" />
      <rect x="56" y="164" width="146" height="42" rx="13" fill="var(--card)" stroke="var(--danger)" strokeWidth="3" />
      <text x="129" y="191" textAnchor="middle" fill="var(--danger)" fontSize="17" fontWeight="950">
        too close
      </text>
      <circle cx="642" cy="334" r="25" fill="var(--card)" stroke="var(--success)" strokeWidth="4" />
      <path
        d="M630 333l8 8 17-20"
        fill="none"
        stroke="var(--success)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {!compact && (
        <>
          <text x="176" y="54" fill="var(--danger)" fontSize="18" fontWeight="950">
            bleed
          </text>
          <text x="174" y="96" fill="var(--primary)" fontSize="18" fontWeight="950">
            trim
          </text>
          <rect
            x="248"
            y="128"
            width="116"
            height="34"
            rx="10"
            fill="var(--card)"
            stroke="var(--success)"
            strokeWidth="2.5"
          />
          <text x="306" y="151" textAnchor="middle" fill="var(--success)" fontSize="17" fontWeight="950">
            safe area
          </text>
        </>
      )}
    </g>
  )
}

export function T({
  x,
  y,
  children,
  fill = 'var(--foreground)',
}: {
  x: number
  y: number
  children: React.ReactNode
  fill?: string
}) {
  return (
    <text x={x} y={y} fill={fill} fontSize="20" fontWeight="850">
      {children}
    </text>
  )
}

export function GenericCoverVisual() {
  return (
    <>
      <rect
        x="105"
        y="126"
        width="590"
        height="210"
        rx="18"
        fill="var(--card)"
        stroke="var(--border)"
        strokeWidth="3"
      />
      <rect x="105" y="126" width="252" height="210" rx="18" fill="color-mix(in srgb, var(--muted) 70%, transparent)" />
      <rect
        x="357"
        y="126"
        width="86"
        height="210"
        fill="color-mix(in srgb, var(--primary) 22%, transparent)"
        stroke="var(--primary)"
        strokeWidth="3"
      />
      <rect
        x="443"
        y="126"
        width="252"
        height="210"
        rx="18"
        fill="color-mix(in srgb, var(--surface) 80%, transparent)"
      />
      <rect
        x="126"
        y="146"
        width="548"
        height="170"
        rx="12"
        fill="transparent"
        stroke="var(--danger)"
        strokeDasharray="8 8"
        strokeWidth="3"
      />
      <rect
        x="154"
        y="174"
        width="492"
        height="114"
        rx="10"
        fill="transparent"
        stroke="var(--success)"
        strokeDasharray="7 7"
        strokeWidth="3"
      />
      <T x={186} y={238}>
        back
      </T>
      <T x={373} y={238}>
        spine
      </T>
      <T x={533} y={238}>
        front
      </T>
      <path d="M250 378h300" stroke="var(--primary)" strokeWidth="4" />
      <T x={248} y={410}>
        trim + bleed + safe area
      </T>
    </>
  )
}

export function CoverInteriorMismatchVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 28)' : undefined}>
      <rect x="76" y="110" width="468" height="210" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="76" y="110" width="198" height="210" rx="18" fill="color-mix(in srgb, var(--muted) 68%, transparent)" />
      <rect
        x="274"
        y="110"
        width="70"
        height="210"
        fill="color-mix(in srgb, var(--primary) 22%, transparent)"
        stroke="var(--primary)"
        strokeWidth="3"
      />
      <rect
        x="344"
        y="110"
        width="200"
        height="210"
        rx="18"
        fill="color-mix(in srgb, var(--surface) 82%, transparent)"
      />
      <rect
        x="98"
        y="132"
        width="424"
        height="166"
        rx="12"
        fill="transparent"
        stroke="var(--danger)"
        strokeDasharray="8 8"
        strokeWidth="3"
      />
      <rect
        x="122"
        y="158"
        width="376"
        height="112"
        rx="10"
        fill="transparent"
        stroke="var(--success)"
        strokeDasharray="7 7"
        strokeWidth="3"
      />
      <T x={145} y={226}>
        back
      </T>
      <T x={284} y={226}>
        spine
      </T>
      <T x={410} y={226}>
        front
      </T>

      <rect x="600" y="86" width="116" height="158" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect
        x="620"
        y="116"
        width="76"
        height="98"
        rx="8"
        fill="color-mix(in srgb, var(--primary) 12%, transparent)"
        stroke="var(--primary)"
        strokeDasharray="7 7"
        strokeWidth="3"
      />
      <T x={613} y={280}>
        interior
      </T>
      <text x="604" y="304" fill="var(--muted-foreground)" fontSize="14" fontWeight="750">
        trim + pages
      </text>

      <path d="M548 210h44" stroke="var(--danger)" strokeWidth="4" strokeDasharray="8 8" opacity=".45" />
      <circle cx="572" cy="210" r="28" fill="var(--card)" />
      <circle
        cx="572"
        cy="210"
        r="24"
        fill="color-mix(in srgb, var(--danger) 10%, transparent)"
        stroke="var(--danger)"
        strokeWidth="4"
      />
      <rect x="568" y="194" width="8" height="22" rx="4" fill="var(--danger)" />
      <circle cx="572" cy="224" r="4.5" fill="var(--danger)" />

      <path d="M92 354h438" stroke="var(--primary)" strokeWidth="4" />
      <path d="M92 344v20M530 344v20" stroke="var(--primary)" strokeWidth="4" />
      <T x={176} y={390}>
        full cover width
      </T>
      {!compact && (
        <>
          <text x="112" y="72" fill="var(--foreground)" fontSize="22" fontWeight="900">
            cover file
          </text>
          <text x="596" y="58" fill="var(--danger)" fontSize="20" fontWeight="900">
            size mismatch
          </text>
        </>
      )}
    </g>
  )
}

export function CoverInteriorMismatchSharpOverlay({ compact = false }: { compact?: boolean }) {
  return (
    <g aria-hidden="true" transform={compact ? 'translate(0 28)' : undefined}>
      <path d="M274 110v210" stroke="var(--primary)" strokeWidth="4" strokeLinecap="square" />
      <path d="M344 110v210" stroke="var(--primary)" strokeWidth="4" strokeLinecap="square" />
      <path d="M274 110h70M274 320h70" stroke="var(--primary)" strokeWidth="4" strokeLinecap="square" />
    </g>
  )
}

export function BarcodeAreaVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 28)' : undefined}>
      <rect x="95" y="102" width="610" height="238" rx="20" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <path
        d="M115 102h245v238H115a20 20 0 0 1-20-20V122a20 20 0 0 1 20-20Z"
        fill="color-mix(in srgb, var(--muted) 68%, transparent)"
      />
      <rect x="360" y="102" width="72" height="238" fill="color-mix(in srgb, var(--primary) 18%, transparent)" />
      <path d="M432 102h253a20 20 0 0 1 20 20v198a20 20 0 0 1-20 20H432Z" fill="var(--card)" />
      <path d="M360 102v238M432 102v238" stroke="var(--primary)" strokeWidth="4" />
      <rect
        x="244"
        y="250"
        width="112"
        height="76"
        rx="12"
        fill="color-mix(in srgb, var(--danger) 12%, transparent)"
        stroke="var(--danger)"
        strokeDasharray="8 8"
        strokeWidth="3"
      />
      <rect x="255" y="260" width="90" height="58" rx="9" fill="var(--card)" stroke="var(--danger)" strokeWidth="3" />
      <rect x="270" y="273" width="8" height="31" fill="var(--foreground)" opacity=".72" />
      <rect x="286" y="273" width="4" height="31" fill="var(--foreground)" opacity=".58" />
      <rect x="298" y="273" width="10" height="31" fill="var(--foreground)" opacity=".68" />
      <rect x="318" y="273" width="5" height="31" fill="var(--foreground)" opacity=".58" />
      <rect x="330" y="273" width="7" height="31" fill="var(--foreground)" opacity=".68" />
      <text x="166" y="225" fill="var(--foreground)" fontSize="22" fontWeight="900">
        back
      </text>
      <text x="376" y="225" fill="var(--foreground)" fontSize="20" fontWeight="900">
        spine
      </text>
      <text x="530" y="225" fill="var(--foreground)" fontSize="22" fontWeight="900">
        front
      </text>
      {!compact && (
        <text x="218" y="82" fill="var(--danger)" fontSize="22" fontWeight="900">
          barcode area contains text
        </text>
      )}
      <path d="M300 250v-62" stroke="var(--danger)" strokeWidth="4" strokeDasharray="8 8" />
      <rect
        x="230"
        y="164"
        width="140"
        height="34"
        rx="10"
        fill="color-mix(in srgb, var(--danger) 12%, transparent)"
        stroke="var(--danger)"
        strokeWidth="3"
      />
      <text x="252" y="187" fill="var(--danger)" fontSize="16" fontWeight="850">
        unsafe text
      </text>
    </g>
  )
}

export function BlurryCoverVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 20)' : undefined}>
      {/* Left panel: blurry / pixelated */}
      <rect x={68} y={88} width={266} height={288} rx={20} fill="var(--card)" stroke="var(--danger)" strokeWidth={3} />
      <rect x={88} y={114} width={226} height={164} rx={10} fill="color-mix(in srgb, var(--primary) 8%, transparent)" />
      {/* Coarse pixel blocks */}
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3, 4].map((col) => (
          <rect
            key={`b-${row}-${col}`}
            x={88 + col * 45}
            y={114 + row * 41}
            width={44}
            height={40}
            fill={`color-mix(in srgb, var(--primary) ${10 + ((row * 7 + col * 11) % 28)}%, transparent)`}
            stroke="var(--card)"
            strokeWidth={1.5}
          />
        ))
      )}
      {/* Blurry text placeholder */}
      <rect x={96} y={294} width={178} height={12} rx={3} fill="var(--foreground)" opacity=".22" />
      <rect x={98} y={297} width={178} height={12} rx={3} fill="var(--foreground)" opacity=".13" />
      <rect x={94} y={291} width={178} height={12} rx={3} fill="var(--foreground)" opacity=".1" />
      <rect x={110} y={320} width={134} height={10} rx={3} fill="var(--foreground)" opacity=".16" />
      {!compact && (
        <text x={90} y={68} fill="var(--danger)" fontSize="20" fontWeight="900">
          blurry after upload
        </text>
      )}
      <circle cx={314} cy={98} r={22} fill="var(--card)" stroke="var(--danger)" strokeWidth={4} />
      <text x={308} y={107} fill="var(--danger)" fontSize="26" fontWeight="950">
        !
      </text>

      {/* Right panel: sharp 300 DPI */}
      <rect
        x={466}
        y={88}
        width={266}
        height={288}
        rx={20}
        fill="var(--card)"
        stroke="var(--success)"
        strokeWidth={3}
      />
      <rect
        x={486}
        y={114}
        width={226}
        height={164}
        rx={10}
        fill="color-mix(in srgb, var(--primary) 16%, transparent)"
      />
      <path d="M490 236c50-65 100-35 152 12" stroke="var(--primary)" strokeWidth={4} strokeLinecap="round" />
      <circle
        cx={556}
        cy={168}
        r={30}
        fill="color-mix(in srgb, var(--primary) 24%, transparent)"
        stroke="var(--primary)"
        strokeWidth={2.5}
      />
      <path d="M618 138l20-20" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round" opacity=".6" />
      <rect x={494} y={294} width={178} height={12} rx={3} fill="var(--foreground)" opacity=".86" />
      <rect x={506} y={320} width={134} height={10} rx={3} fill="var(--foreground)" opacity=".65" />
      {!compact && (
        <text x={468} y={68} fill="var(--success)" fontSize="20" fontWeight="900">
          sharp: 300 DPI
        </text>
      )}

      {/* Comparison label strip */}
      <path d="M68 404h700" stroke="var(--primary)" strokeWidth={3} opacity=".35" />
      <text x={134} y={430} fill="var(--muted-foreground)" fontSize="14" fontWeight="800">
        low resolution
      </text>
      <text x={518} y={430} fill="var(--muted-foreground)" fontSize="14" fontWeight="800">
        print-ready quality
      </text>
    </g>
  )
}

export function FileMismatchVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 22)' : undefined}>
      {/* Interior page — left */}
      <rect x="68" y="88" width="196" height="266" rx="16" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="88" y="112" width="156" height="11" rx="3" fill="var(--foreground)" opacity=".18" />
      <rect x="88" y="131" width="136" height="9" rx="3" fill="var(--foreground)" opacity=".12" />
      <rect x="88" y="148" width="148" height="9" rx="3" fill="var(--foreground)" opacity=".12" />
      <rect x="88" y="165" width="126" height="9" rx="3" fill="var(--foreground)" opacity=".12" />
      <rect
        x="88"
        y="210"
        width="156"
        height="34"
        rx="9"
        fill="color-mix(in srgb, var(--primary) 12%, transparent)"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeDasharray="6 6"
      />
      <text x="166" y="233" textAnchor="middle" fill="var(--primary)" fontSize="13" fontWeight="850">
        trim: 6 × 9 in
      </text>
      <text x="166" y="302" textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="750">
        200 pages · cream
      </text>
      {!compact && (
        <text x="100" y="76" fill="var(--foreground)" fontSize="16" fontWeight="850">
          interior file
        </text>
      )}
      {/* Warning circle center */}
      <circle cx="400" cy="222" r="40" fill="var(--card)" stroke="var(--danger)" strokeWidth="4" />
      <circle cx="400" cy="222" r="31" fill="color-mix(in srgb, var(--danger) 13%, transparent)" />
      <rect x="396" y="204" width="8" height="22" rx="4" fill="var(--danger)" />
      <circle cx="400" cy="237" r="5" fill="var(--danger)" />
      <text x="400" y="278" textAnchor="middle" fill="var(--danger)" fontSize="13" fontWeight="850">
        mismatch
      </text>
      <path d="M264 222h100" stroke="var(--danger)" strokeWidth="3" strokeDasharray="7 7" opacity=".55" />
      <path d="M440 222h82" stroke="var(--danger)" strokeWidth="3" strokeDasharray="7 7" opacity=".55" />
      {/* Cover file — right, full wrap */}
      <rect
        x="522"
        y="122"
        width="250"
        height="176"
        rx="14"
        fill="var(--card)"
        stroke="var(--danger)"
        strokeWidth="3"
      />
      <path
        d="M536 122h80v176h-80a14 14 0 0 1-14-14v-148a14 14 0 0 1 14-14z"
        fill="color-mix(in srgb, var(--muted) 56%, transparent)"
      />
      <rect x="616" y="122" width="36" height="176" fill="color-mix(in srgb, var(--danger) 18%, transparent)" />
      <path d="M616 122v176M652 122v176" stroke="var(--danger)" strokeWidth="2" />
      <path
        d="M652 122h106a14 14 0 0 1 14 14v148a14 14 0 0 1-14 14h-106z"
        fill="color-mix(in srgb, var(--surface) 80%, transparent)"
      />
      <text x="560" y="218" textAnchor="middle" fill="var(--foreground)" fontSize="13" fontWeight="800">
        back
      </text>
      <text x="634" y="218" textAnchor="middle" fill="var(--danger)" fontSize="12" fontWeight="850">
        spine
      </text>
      <text x="704" y="218" textAnchor="middle" fill="var(--foreground)" fontSize="13" fontWeight="800">
        front
      </text>
      {!compact && (
        <>
          <text x="522" y="110" fill="var(--danger)" fontSize="15" fontWeight="850">
            wrong trim size
          </text>
          <text x="562" y="318" textAnchor="middle" fill="var(--foreground)" fontSize="16" fontWeight="850">
            cover file
          </text>
        </>
      )}
    </g>
  )
}

export function ForgotBleedVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 26)' : undefined}>
      <rect
        x="78"
        y="98"
        width="260"
        height="250"
        rx="20"
        fill="color-mix(in srgb, var(--success) 9%, transparent)"
        stroke="var(--success)"
        strokeWidth="3"
      />
      <rect
        x="98"
        y="118"
        width="220"
        height="210"
        rx="16"
        fill="color-mix(in srgb, var(--primary) 15%, transparent)"
        stroke="var(--primary)"
        strokeWidth="3"
      />
      <rect x="138" y="160" width="140" height="102" rx="12" fill="var(--card)" opacity=".72" />
      <text x="208" y="224" textAnchor="middle" fill="var(--success)" fontSize="22" fontWeight="950">
        bleed on
      </text>
      <text x="208" y="376" textAnchor="middle" fill="var(--success)" fontSize="15" fontWeight="850">
        art extends past trim
      </text>

      <path d="M374 222h58" stroke="var(--border)" strokeWidth="4" strokeDasharray="8 8" />
      <circle cx="403" cy="222" r="26" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
      <path d="M392 222h22" stroke="var(--primary)" strokeWidth="4" />

      <rect x="474" y="98" width="260" height="250" rx="20" fill="var(--card)" stroke="var(--danger)" strokeWidth="3" />
      <rect
        x="512"
        y="118"
        width="202"
        height="210"
        rx="14"
        fill="color-mix(in srgb, var(--primary) 15%, transparent)"
      />
      <rect x="492" y="118" width="20" height="210" rx="4" fill="var(--card)" stroke="var(--danger)" strokeWidth="2" />
      <rect x="544" y="160" width="130" height="102" rx="12" fill="var(--card)" opacity=".72" />
      <text x="609" y="224" textAnchor="middle" fill="var(--danger)" fontSize="22" fontWeight="950">
        missing
      </text>
      <text x="609" y="376" textAnchor="middle" fill="var(--danger)" fontSize="15" fontWeight="850">
        white edge after trim
      </text>
      {!compact && (
        <text x="172" y="68" fill="var(--foreground)" fontSize="22" fontWeight="900">
          forgot bleed on KDP
        </text>
      )}
    </g>
  )
}

export function ColorShiftVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 18)' : undefined}>
      {/* Left panel — vivid screen */}
      <rect x="88" y="84" width="258" height="250" rx="20" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
      {/* Top bar */}
      <rect x="88" y="84" width="258" height="36" rx="20" fill="color-mix(in srgb, var(--primary) 14%, transparent)" />
      <circle cx="108" cy="102" r="5" fill="var(--danger)" />
      <circle cx="124" cy="102" r="5" fill="color-mix(in srgb, var(--primary) 80%, var(--foreground))" />
      <circle cx="140" cy="102" r="5" fill="var(--success)" />
      {/* Vivid swatches */}
      <rect x="102" y="134" width="64" height="58" rx="9" fill="color-mix(in srgb, var(--danger) 70%, transparent)" />
      <rect x="178" y="134" width="64" height="58" rx="9" fill="color-mix(in srgb, var(--primary) 74%, transparent)" />
      <rect x="254" y="134" width="64" height="58" rx="9" fill="color-mix(in srgb, var(--success) 68%, transparent)" />
      {/* Title */}
      <rect x="102" y="206" width="230" height="40" rx="8" fill="var(--foreground)" opacity=".88" />
      <text x="217" y="232" textAnchor="middle" fill="var(--card)" fontSize="16" fontWeight="950">
        BOOK TITLE
      </text>
      <rect x="140" y="258" width="154" height="12" rx="5" fill="var(--primary)" opacity=".55" />
      {/* Screen label */}
      <rect x="130" y="356" width="116" height="28" rx="8" fill="var(--card)" stroke="var(--primary)" strokeWidth="2" />
      <text x="188" y="375" textAnchor="middle" fill="var(--primary)" fontSize="11" fontWeight="850">
        screen — vivid
      </text>

      {/* VS */}
      <circle cx="400" cy="208" r="26" fill="var(--card)" stroke="var(--border)" strokeWidth="2.5" />
      <text x="400" y="215" textAnchor="middle" fill="var(--muted-foreground)" fontSize="14" fontWeight="900">
        vs
      </text>

      {/* Right panel — muted print */}
      <rect x="454" y="84" width="258" height="250" rx="20" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <rect x="454" y="84" width="258" height="36" rx="20" fill="color-mix(in srgb, var(--muted) 45%, transparent)" />
      {/* Muted swatches */}
      <rect x="468" y="134" width="64" height="58" rx="9" fill="color-mix(in srgb, var(--danger) 22%, transparent)" />
      <rect x="544" y="134" width="64" height="58" rx="9" fill="color-mix(in srgb, var(--primary) 24%, transparent)" />
      <rect x="620" y="134" width="64" height="58" rx="9" fill="color-mix(in srgb, var(--success) 20%, transparent)" />
      {/* Title — darker / duller */}
      <rect x="468" y="206" width="230" height="40" rx="8" fill="var(--foreground)" opacity=".50" />
      <text x="583" y="232" textAnchor="middle" fill="var(--card)" fontSize="16" fontWeight="950">
        BOOK TITLE
      </text>
      <rect x="506" y="258" width="154" height="12" rx="5" fill="var(--muted-foreground)" opacity=".35" />
      {/* Warning */}
      <circle cx="688" cy="102" r="18" fill="var(--card)" stroke="var(--danger)" strokeWidth="3" />
      <text x="682" y="110" fill="var(--danger)" fontSize="20" fontWeight="950">
        !
      </text>
      {/* Print label */}
      <rect x="494" y="356" width="178" height="28" rx="8" fill="var(--card)" stroke="var(--border)" strokeWidth="2" />
      <text x="583" y="375" textAnchor="middle" fill="var(--muted-foreground)" fontSize="11" fontWeight="850">
        print — softer &amp; darker
      </text>

      {!compact && (
        <text x="240" y="60" fill="var(--foreground)" fontSize="20" fontWeight="950">
          screen vs print color shift
        </text>
      )}
    </g>
  )
}

export function BleedVsNoBleedVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 24)' : undefined}>
      <rect
        x="82"
        y="94"
        width="282"
        height="250"
        rx="22"
        fill="color-mix(in srgb, var(--success) 9%, transparent)"
        stroke="var(--success)"
        strokeWidth="3"
        strokeDasharray="9 8"
      />
      <rect
        x="112"
        y="124"
        width="222"
        height="190"
        rx="16"
        fill="color-mix(in srgb, var(--primary) 16%, transparent)"
        stroke="var(--primary)"
        strokeWidth="3"
      />
      <rect x="162" y="172" width="122" height="76" rx="12" fill="var(--card)" opacity=".74" />
      <text x="223" y="219" textAnchor="middle" fill="var(--success)" fontSize="24" fontWeight="950">
        bleed
      </text>
      <text x="223" y="374" textAnchor="middle" fill="var(--success)" fontSize="15" fontWeight="850">
        edge-to-edge art
      </text>

      <rect
        x="444"
        y="124"
        width="222"
        height="190"
        rx="16"
        fill="var(--card)"
        stroke="var(--border)"
        strokeWidth="3"
      />
      <rect
        x="492"
        y="164"
        width="126"
        height="110"
        rx="12"
        fill="color-mix(in srgb, var(--primary) 11%, transparent)"
        stroke="var(--primary)"
        strokeWidth="2.5"
      />
      <rect x="512" y="194" width="86" height="10" rx="3" fill="var(--foreground)" opacity=".2" />
      <rect x="526" y="220" width="58" height="8" rx="3" fill="var(--foreground)" opacity=".14" />
      <text x="555" y="219" textAnchor="middle" fill="var(--primary)" fontSize="24" fontWeight="950">
        no bleed
      </text>
      <text x="555" y="374" textAnchor="middle" fill="var(--primary)" fontSize="15" fontWeight="850">
        intentional margins
      </text>

      <path d="M386 220h36" stroke="var(--border)" strokeWidth="4" strokeDasharray="7 7" />
      {!compact && (
        <text x="250" y="64" fill="var(--foreground)" fontSize="22" fontWeight="900">
          choose the right KDP setting
        </text>
      )}
    </g>
  )
}

export function CroppedCoverVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 24)' : undefined}>
      <rect
        x="130"
        y="76"
        width="540"
        height="310"
        rx="24"
        fill="color-mix(in srgb, var(--danger) 8%, transparent)"
        stroke="var(--danger)"
        strokeWidth="4"
        strokeDasharray="10 10"
      />
      <rect
        x="178"
        y="118"
        width="444"
        height="226"
        rx="18"
        fill="var(--card)"
        stroke="var(--primary)"
        strokeWidth="4"
      />
      <rect
        x="224"
        y="154"
        width="352"
        height="154"
        rx="14"
        fill="color-mix(in srgb, var(--success) 9%, transparent)"
        stroke="var(--success)"
        strokeDasharray="8 8"
        strokeWidth="3"
      />
      <path
        d="M132 310c76-58 142-46 212-18 84 34 155 52 326-26v120H130Z"
        fill="color-mix(in srgb, var(--primary) 18%, transparent)"
      />
      <path d="M178 118v226M622 118v226" stroke="var(--primary)" strokeWidth="4" opacity=".75" />
      <rect
        x="190"
        y="306"
        width="176"
        height="44"
        rx="10"
        fill="color-mix(in srgb, var(--danger) 12%, var(--card))"
        stroke="var(--danger)"
        strokeWidth="3"
      />
      <text x="214" y="335" fill="var(--danger)" fontSize="22" fontWeight="900">
        TEXT CUT
      </text>
      <path d="M178 344h444" stroke="var(--danger)" strokeWidth="4" />
      <circle cx="622" cy="118" r="30" fill="var(--card)" stroke="var(--danger)" strokeWidth="5" />
      <text x="613" y="129" fill="var(--danger)" fontSize="34" fontWeight="950">
        !
      </text>
      {!compact && (
        <>
          <text x="170" y="56" fill="var(--foreground)" fontSize="22" fontWeight="900">
            bleed / trim / safe area mismatch
          </text>
          <text x="492" y="374" fill="var(--muted-foreground)" fontSize="16" fontWeight="800">
            Previewer crop simulation
          </text>
        </>
      )}
    </g>
  )
}

export function SlowUploadVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 18)' : undefined}>
      {/* Heavy PDF document — left */}
      <rect x="76" y="80" width="152" height="198" rx="14" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <path
        d="M196 80l32 32h-32Z"
        fill="color-mix(in srgb, var(--muted) 60%, transparent)"
        stroke="var(--border)"
        strokeWidth="2"
      />
      <rect x="96" y="132" width="92" height="8" rx="4" fill="var(--foreground)" opacity=".15" />
      <rect x="96" y="148" width="76" height="8" rx="4" fill="var(--foreground)" opacity=".11" />
      <rect x="96" y="164" width="86" height="8" rx="4" fill="var(--foreground)" opacity=".11" />
      <rect x="96" y="180" width="64" height="8" rx="4" fill="var(--foreground)" opacity=".11" />
      <rect
        x="96"
        y="200"
        width="60"
        height="22"
        rx="6"
        fill="color-mix(in srgb, var(--danger) 14%, transparent)"
        stroke="var(--danger)"
        strokeWidth="2"
      />
      <text x="126" y="216" textAnchor="middle" fill="var(--danger)" fontSize="12" fontWeight="900">
        PDF
      </text>
      {/* File size badge */}
      <rect
        x="76"
        y="296"
        width="152"
        height="34"
        rx="10"
        fill="color-mix(in srgb, var(--danger) 10%, transparent)"
        stroke="var(--danger)"
        strokeWidth="2.5"
      />
      <text x="152" y="319" textAnchor="middle" fill="var(--danger)" fontSize="16" fontWeight="900">
        320 MB
      </text>

      {/* Upload arrow */}
      <path d="M256 178h82" stroke="var(--border)" strokeWidth="3.5" strokeDasharray="8 6" />
      <path
        d="M320 161l18 17-18 17"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Progress panel — right */}
      <rect x="358" y="84" width="368" height="248" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <text x="542" y="122" textAnchor="middle" fill="var(--foreground)" fontSize="14" fontWeight="850">
        KDP manuscript processing
      </text>
      {/* Progress bar track */}
      <rect x="382" y="140" width="320" height="18" rx="9" fill="var(--muted)" opacity=".45" />
      {/* Progress bar fill — stuck at ~76% */}
      <rect x="382" y="140" width="244" height="18" rx="9" fill="var(--primary)" opacity=".55" />
      {/* Stuck marker */}
      <circle cx="626" cy="149" r="11" fill="var(--card)" stroke="var(--danger)" strokeWidth="3" />
      <rect x="622" y="141" width="7" height="11" rx="3.5" fill="var(--danger)" />
      <circle cx="626" cy="156" r="3.5" fill="var(--danger)" />
      {/* Progress label */}
      <text x="542" y="178" textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" fontWeight="750">
        76% · still processing…
      </text>
      {/* Stuck warning box */}
      <rect
        x="382"
        y="196"
        width="320"
        height="114"
        rx="14"
        fill="color-mix(in srgb, var(--danger) 7%, transparent)"
        stroke="var(--danger)"
        strokeDasharray="8 5"
        strokeWidth="2.5"
      />
      <text x="542" y="230" textAnchor="middle" fill="var(--danger)" fontSize="14" fontWeight="900">
        upload stuck
      </text>
      <text x="542" y="252" textAnchor="middle" fill="var(--muted-foreground)" fontSize="12">
        compress images · flatten PDF
      </text>
      <text x="542" y="272" textAnchor="middle" fill="var(--muted-foreground)" fontSize="12">
        re-export · split-test manuscript
      </text>
      {/* Warning circle top right */}
      <circle cx="694" cy="102" r="22" fill="var(--card)" stroke="var(--danger)" strokeWidth="3.5" />
      <rect x="690" y="88" width="8" height="17" rx="4" fill="var(--danger)" />
      <circle cx="694" cy="113" r="4.5" fill="var(--danger)" />
      {!compact && (
        <text x="168" y="62" fill="var(--foreground)" fontSize="20" fontWeight="900">
          KDP upload stuck processing
        </text>
      )}
    </g>
  )
}

export function PreviewerFrozenVisual({ compact = false }: { compact?: boolean }) {
  return (
    <g transform={compact ? 'translate(0 18)' : undefined}>
      {/* Browser chrome */}
      <rect x="82" y="72" width="636" height="316" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      {/* Browser top bar */}
      <rect x="82" y="72" width="636" height="44" rx="18" fill="color-mix(in srgb, var(--muted) 45%, transparent)" />
      <rect x="82" y="95" width="636" height="21" fill="color-mix(in srgb, var(--muted) 45%, transparent)" />
      {/* Traffic lights */}
      <circle cx="110" cy="94" r="7" fill="var(--danger)" opacity=".65" />
      <circle cx="130" cy="94" r="7" fill="color-mix(in srgb, var(--primary) 75%, transparent)" opacity=".65" />
      <circle cx="150" cy="94" r="7" fill="var(--success)" opacity=".65" />
      {/* URL bar */}
      <rect x="198" y="82" width="424" height="24" rx="7" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
      <text x="410" y="98" textAnchor="middle" fill="var(--muted-foreground)" fontSize="11">
        kdp.amazon.com · launching preview…
      </text>
      {/* KDP content area */}
      <rect x="98" y="132" width="604" height="240" rx="10" fill="color-mix(in srgb, var(--muted) 15%, transparent)" />
      {/* Launch Preview button — greyed out */}
      <rect
        x="312"
        y="144"
        width="176"
        height="36"
        rx="10"
        fill="color-mix(in srgb, var(--muted) 50%, transparent)"
        stroke="var(--border)"
        strokeWidth="2"
      />
      <text x="400" y="167" textAnchor="middle" fill="var(--muted-foreground)" fontSize="14" fontWeight="800">
        Launch Preview
      </text>
      {/* Preview pane */}
      <rect
        x="172"
        y="194"
        width="456"
        height="162"
        rx="14"
        fill="var(--card)"
        stroke="var(--border)"
        strokeWidth="2.5"
      />
      {/* Spinner track */}
      <circle cx="400" cy="252" r="42" fill="none" stroke="var(--muted)" strokeWidth="7" opacity=".4" />
      {/* Spinner arc — 3/4 clockwise from 12 to 9 o'clock */}
      <path
        d="M400 210 a42 42 0 1 1 -42 42"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="7"
        strokeLinecap="round"
        opacity=".7"
      />
      {/* Frozen label */}
      <rect
        x="312"
        y="320"
        width="176"
        height="26"
        rx="8"
        fill="color-mix(in srgb, var(--danger) 10%, transparent)"
        stroke="var(--danger)"
        strokeWidth="2"
      />
      <text x="400" y="337" textAnchor="middle" fill="var(--danger)" fontSize="12" fontWeight="850">
        Preview not loading
      </text>
      {/* Warning badge */}
      <circle cx="676" cy="152" r="22" fill="var(--card)" stroke="var(--danger)" strokeWidth="3.5" />
      <rect x="672" y="138" width="8" height="17" rx="4" fill="var(--danger)" />
      <circle cx="676" cy="162" r="4.5" fill="var(--danger)" />
      {!compact && (
        <text x="192" y="54" fill="var(--foreground)" fontSize="20" fontWeight="900">
          KDP Previewer frozen
        </text>
      )}
    </g>
  )
}

export function SafeAreaFixVisual({ compact = false }: Readonly<{ compact?: boolean }>) {
  const dy = compact ? 18 : 0
  // Cover: x=130, y=72, w=540, h=306
  const cx = 130,
    cy = 72 + dy,
    cw = 540,
    ch = 306
  // Safe zone inset 52px
  const sx = cx + 52,
    sy = cy + 52,
    sw = cw - 104,
    sh = ch - 104

  return (
    <g>
      {/* Cover background */}
      <rect
        x={cx}
        y={cy}
        width={cw}
        height={ch}
        rx="6"
        fill="color-mix(in srgb, var(--primary) 8%, var(--card))"
        stroke="var(--border)"
        strokeWidth="2"
      />

      {/* Safe zone boundary */}
      <rect
        x={sx}
        y={sy}
        width={sw}
        height={sh}
        rx="12"
        fill="color-mix(in srgb, var(--success) 7%, transparent)"
        stroke="var(--success)"
        strokeWidth="2"
        strokeDasharray="7 4"
      />

      {/* Unsafe subtitle — below safe zone bottom edge */}
      <rect
        x={cx + 90}
        y={cy + ch - 34}
        width={360}
        height={22}
        rx="5"
        fill="color-mix(in srgb, var(--danger) 14%, var(--card))"
        stroke="var(--danger)"
        strokeWidth="1.5"
      />
      <text
        x={cx + cw / 2}
        y={cy + ch - 19}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--danger)"
        fontSize="12"
        fontWeight="850"
      >
        Subtitle — too close to trim edge
      </text>

      {/* Warning badge on subtitle */}
      <circle cx={cx + 74} cy={cy + ch - 23} r="14" fill="var(--card)" stroke="var(--danger)" strokeWidth="2.5" />
      <text
        x={cx + 74}
        y={cy + ch - 23}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--danger)"
        fontSize="13"
        fontWeight="950"
      >
        !
      </text>

      {/* Safe title inside safe zone */}
      <rect x={sx + 36} y={sy + 36} width={sw - 72} height={30} rx="6" fill="var(--foreground)" opacity=".8" />
      <text
        x={cx + cw / 2}
        y={sy + 57}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--card)"
        fontSize="14"
        fontWeight="950"
      >
        BOOK TITLE
      </text>

      {/* Author — inside safe zone, comfortable spacing */}
      <text
        x={cx + cw / 2}
        y={sy + sh - 28}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--muted-foreground)"
        fontSize="12"
      >
        Author Name
      </text>
      <circle
        cx={cx + cw / 2 + 90}
        cy={sy + sh - 28}
        r="11"
        fill="color-mix(in srgb, var(--success) 12%, var(--card))"
        stroke="var(--success)"
        strokeWidth="2"
      />
      <text
        x={cx + cw / 2 + 90}
        y={sy + sh - 28}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--success)"
        fontSize="11"
        fontWeight="950"
      >
        ✓
      </text>

      {/* Safe area label */}
      <text x={sx + 8} y={sy + 16} fill="var(--success)" fontSize="11" fontWeight="850">
        safe area
      </text>

      {!compact && (
        <text x={cx + 16} y={cy - 14} fill="var(--foreground)" fontSize="20" fontWeight="900">
          text outside safe area — fix before upload
        </text>
      )}
    </g>
  )
}

export function WhiteLinesVisual({ compact = false }: { compact?: boolean }) {
  const dy = compact ? 22 : 0

  // Intended trim dimensions
  const bx = 110,
    by = 100 + dy,
    bw = 400,
    bh = 240
  const bleed = 18

  // Trim shift
  const shift = 14

  // Physical paper (cut result)
  const cutX = bx + shift,
    cutY = by,
    cutW = bw,
    cutH = bh

  // Printed background (stops at intended trim)
  const bgX = bx,
    bgY = by,
    bgW = bw,
    bgH = bh

  return (
    <g>
      {/* 1. PHYSICAL PAPER AND PRINTED BACKGROUND */}
      {/* Physical Paper */}
      <rect
        x={cutX}
        y={cutY}
        width={cutW}
        height={cutH}
        rx={2}
        fill="var(--card)"
        stroke="var(--border)"
        strokeWidth={2}
        style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.08))' }}
      />

      {/* Background printed on the paper */}
      <rect
        x={cutX}
        y={cutY}
        width={bgX + bgW - cutX}
        height={bgH}
        rx={1}
        fill="color-mix(in srgb, var(--foreground) 85%, var(--card))"
      />

      {/* Spine fold lines for realism */}
      <path
        d={`M ${cutX + cutW / 2 - 24} ${cutY} v ${cutH} M ${cutX + cutW / 2 + 24} ${cutY} v ${cutH}`}
        stroke="var(--card)"
        strokeWidth={2}
        opacity={0.15}
      />

      <text
        x={cutX + cutW / 2}
        y={cutY + cutH / 2}
        textAnchor="middle"
        transform={`rotate(-90 ${cutX + cutW / 2} ${cutY + cutH / 2})`}
        fill="var(--card)"
        fontSize={12}
        fontWeight={800}
        opacity={0.5}
      >
        SPINE
      </text>

      {/* Front cover content */}
      <rect
        x={cutX + cutW * 0.75 - 70}
        y={cutY + 40}
        width={140}
        height={130}
        rx={8}
        fill="var(--card)"
        opacity={0.05}
        stroke="var(--card)"
        strokeWidth={2}
        strokeDasharray="4 4"
      />
      <text
        x={cutX + cutW * 0.75}
        y={cutY + 80}
        textAnchor="middle"
        fill="var(--card)"
        fontSize={18}
        fontWeight={950}
        opacity={0.95}
      >
        BOOK TITLE
      </text>
      <rect x={cutX + cutW * 0.75 - 40} y={cutY + 100} width={80} height={6} rx={3} fill="var(--card)" opacity={0.6} />
      <rect x={cutX + cutW * 0.75 - 60} y={cutY + 115} width={120} height={6} rx={3} fill="var(--card)" opacity={0.4} />

      {/* 2. BOUNDARY LINES */}
      {/* Bleed boundary */}
      <rect
        x={bx - bleed}
        y={by - bleed}
        width={bw + bleed * 2}
        height={bh + bleed * 2}
        rx={6}
        fill="color-mix(in srgb, var(--danger) 4%, transparent)"
        stroke="var(--danger)"
        strokeDasharray="6 6"
        strokeWidth={2.5}
      />

      {/* Intended Trim line */}
      <rect
        x={bx}
        y={by}
        width={bw}
        height={bh}
        fill="none"
        stroke="var(--primary)"
        strokeDasharray="4 4"
        strokeWidth={2.5}
        opacity={0.8}
      />

      {/* 3. LABELS */}
      {/* Label for required bleed */}
      <rect
        x={bx - bleed + 8}
        y={by - bleed + 8}
        width={100}
        height={24}
        rx={6}
        fill="var(--card)"
        stroke="var(--danger)"
        strokeWidth={2}
      />
      <text
        x={bx - bleed + 58}
        y={by - bleed + 24}
        textAnchor="middle"
        fill="var(--danger)"
        fontSize={11}
        fontWeight={850}
      >
        required bleed
      </text>

      {/* Label for intended trim */}
      <rect
        x={bx + 8}
        y={by + 16}
        width={100}
        height={24}
        rx={6}
        fill="var(--card)"
        stroke="var(--primary)"
        strokeWidth={2}
        opacity={0.9}
      />
      <text x={bx + 58} y={by + 32} textAnchor="middle" fill="var(--primary)" fontSize={11} fontWeight={850}>
        intended trim
      </text>

      {/* Right side labels */}
      {/* 1. White Line gap */}
      <path
        d={`M ${cutX + cutW + 30} ${cutY + 60} L ${cutX + cutW - 4} ${cutY + 60}`}
        stroke="var(--danger)"
        strokeWidth={2.5}
      />
      <circle cx={cutX + cutW - 4} cy={cutY + 60} r={4} fill="var(--danger)" />

      <rect
        x={cutX + cutW + 30}
        y={cutY + 35}
        width={180}
        height={50}
        rx={10}
        fill="color-mix(in srgb, var(--danger) 8%, var(--card))"
        stroke="var(--danger)"
        strokeWidth={2}
      />
      <text x={cutX + cutW + 120} y={cutY + 54} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={900}>
        WHITE LINE
      </text>
      <text x={cutX + cutW + 120} y={cutY + 72} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={750}>
        exposed unprinted paper
      </text>

      {/* 2. Background stopped at trim */}
      <path
        d={`M ${bx + bw + 30} ${cutY + 140} L ${bx + bw + 2} ${cutY + 140}`}
        stroke="var(--primary)"
        strokeWidth={2.5}
      />
      <circle cx={bx + bw + 2} cy={cutY + 140} r={4} fill="var(--primary)" />

      <rect
        x={bx + bw + 30}
        y={cutY + 115}
        width={180}
        height={50}
        rx={10}
        fill="var(--card)"
        stroke="var(--primary)"
        strokeWidth={2}
      />
      <text x={bx + bw + 120} y={cutY + 134} textAnchor="middle" fill="var(--primary)" fontSize={13} fontWeight={900}>
        BACKGROUND STOPPED
      </text>
      <text x={bx + bw + 120} y={cutY + 152} textAnchor="middle" fill="var(--primary)" fontSize={11} fontWeight={750}>
        did not extend into bleed
      </text>

      {!compact && (
        <>
          <text x={400} y={by - 26} textAnchor="middle" fill="var(--foreground)" fontSize={22} fontWeight={950}>
            Why white lines appear on printed covers
          </text>

          <rect
            x={120}
            y={by + bh + 30}
            width={560}
            height={36}
            rx={12}
            fill="color-mix(in srgb, var(--danger) 10%, var(--card))"
            stroke="var(--danger)"
            strokeWidth={2}
            opacity={0.8}
          />
          <text x={400} y={by + bh + 53} textAnchor="middle" fill="var(--danger)" fontSize={14} fontWeight={850}>
            trim shifts outward → cut misses background → blank paper exposed
          </text>
        </>
      )}
    </g>
  )
}

export function KdpBordersPrintUnevenlyVisual({ compact = false }: { compact?: boolean }) {
  if (compact) {
    const bx = 275, by = 72, bw = 250, bh = 310;
    const gapL = 8, gapR = 50;

    return (
      <g>
        <rect x={bx} y={by} width={bw} height={bh} rx={10}
          fill="color-mix(in srgb, var(--foreground) 84%, transparent)" />
        <rect x={bx + gapL} y={by + 22} width={bw - gapL - gapR} height={bh - 44}
          rx={3} fill="none" stroke="rgba(255,255,255,0.76)" strokeWidth={2.5} />
        <line x1={bx - 2} y1={by + bh / 2} x2={bx + gapL} y2={by + bh / 2}
          stroke="var(--danger)" strokeWidth={1.5} strokeDasharray="2 1" />
        <rect x={bx - 44} y={by + bh / 2 - 13} width={42} height={26} rx={6}
          fill="var(--card)" stroke="var(--danger)" strokeWidth={1.5} />
        <text x={bx - 23} y={by + bh / 2 + 6} textAnchor="middle"
          fill="var(--danger)" fontSize={12} fontWeight={900}>8 px</text>
        <line x1={bx + bw - gapR} y1={by + bh / 2} x2={bx + bw + 2} y2={by + bh / 2}
          stroke="var(--muted-foreground)" strokeWidth={1.5} strokeDasharray="2 1" />
        <rect x={bx + bw + 4} y={by + bh / 2 - 13} width={44} height={26} rx={6}
          fill="var(--card)" stroke="var(--muted-foreground)" strokeWidth={1.5} />
        <text x={bx + bw + 26} y={by + bh / 2 + 6} textAnchor="middle"
          fill="var(--muted-foreground)" fontSize={12} fontWeight={900}>50 px</text>
        <circle cx={bx + bw - 18} cy={by + 18} r={14}
          fill="color-mix(in srgb, var(--danger) 18%, transparent)" stroke="var(--danger)" strokeWidth={2} />
        <text x={bx + bw - 18} y={by + 24} textAnchor="middle"
          fill="var(--danger)" fontSize={15} fontWeight={950}>!</text>
      </g>
    );
  }

  const bw = 216, bh = 258;

  return (
    <g>
      <rect x={100} y={46} width={194} height={36} rx={18}
        fill="var(--card)" stroke="color-mix(in srgb, var(--danger) 45%, var(--border))" strokeWidth={2} />
      <text x={197} y={70} textAnchor="middle" fill="var(--danger)" fontSize={13} fontWeight={950} letterSpacing={1.6}>BORDER SHIFT</text>
      <rect x={314} y={46} width={268} height={36} rx={18}
        fill="var(--card)" stroke="var(--border)" strokeWidth={2} />
      <text x={448} y={70} textAnchor="middle" fill="var(--muted-foreground)" fontSize={13} fontWeight={850}>trim moves · border looks wrong</text>

      <text x={62 + bw / 2} y={96} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={800}>PDF file</text>
      <rect x={62} y={104} width={bw} height={bh} rx={10}
        fill="color-mix(in srgb, var(--foreground) 84%, transparent)" />
      <rect x={62 + 18} y={104 + 18} width={bw - 36} height={bh - 36}
        rx={3} fill="none" stroke="rgba(255,255,255,0.72)" strokeWidth={2.5} />
      <line x1={62 - 2} y1={104 + bh / 2} x2={62 + 18} y2={104 + bh / 2}
        stroke="var(--success)" strokeWidth={1.5} strokeDasharray="2 1" />
      <rect x={20} y={104 + bh / 2 - 11} width={42} height={22} rx={5}
        fill="var(--card)" stroke="var(--success)" strokeWidth={1.5} />
      <text x={41} y={104 + bh / 2 + 5} textAnchor="middle" fill="var(--success)" fontSize={11} fontWeight={900}>18 px</text>
      <line x1={62 + bw - 18} y1={104 + bh / 2} x2={62 + bw + 2} y2={104 + bh / 2}
        stroke="var(--success)" strokeWidth={1.5} strokeDasharray="2 1" />
      <rect x={62 + bw + 4} y={104 + bh / 2 - 11} width={42} height={22} rx={5}
        fill="var(--card)" stroke="var(--success)" strokeWidth={1.5} />
      <text x={62 + bw + 25} y={104 + bh / 2 + 5} textAnchor="middle" fill="var(--success)" fontSize={11} fontWeight={900}>18 px</text>
      <circle cx={62 + bw / 2} cy={104 + bh + 26} r={13}
        fill="color-mix(in srgb, var(--success) 16%, transparent)" stroke="var(--success)" strokeWidth={2} />
      <path d={`M${62 + bw / 2 - 7} ${104 + bh + 26} l4 5 10-9`}
        fill="none" stroke="var(--success)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      <text x={398} y={174} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10} fontWeight={800}>print</text>
      <text x={398} y={188} textAnchor="middle" fill="var(--muted-foreground)" fontSize={10} fontWeight={800}>&amp; cut</text>
      <path d="M348 180 h100" stroke="var(--primary)" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M438 172 l10 8 -10 8" fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      <text x={476 + bw / 2} y={96} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={800}>Printed copy</text>
      <rect x={476} y={104} width={bw} height={bh} rx={10}
        fill="color-mix(in srgb, var(--foreground) 84%, transparent)" />
      <rect x={476 + 6} y={104 + 18} width={bw - 36} height={bh - 36}
        rx={3} fill="none" stroke="rgba(255,255,255,0.72)" strokeWidth={2.5} />
      <line x1={476 - 2} y1={104 + bh / 2} x2={476 + 6} y2={104 + bh / 2}
        stroke="var(--danger)" strokeWidth={1.5} strokeDasharray="2 1" />
      <rect x={434} y={104 + bh / 2 - 11} width={40} height={22} rx={5}
        fill="var(--card)" stroke="var(--danger)" strokeWidth={1.5} />
      <text x={454} y={104 + bh / 2 + 5} textAnchor="middle" fill="var(--danger)" fontSize={11} fontWeight={900}>6 px</text>
      <line x1={476 + bw - 30} y1={104 + bh / 2} x2={476 + bw + 2} y2={104 + bh / 2}
        stroke="var(--muted-foreground)" strokeWidth={1.5} strokeDasharray="2 1" />
      <rect x={476 + bw + 4} y={104 + bh / 2 - 11} width={42} height={22} rx={5}
        fill="var(--card)" stroke="var(--muted-foreground)" strokeWidth={1.5} />
      <text x={476 + bw + 25} y={104 + bh / 2 + 5} textAnchor="middle" fill="var(--muted-foreground)" fontSize={11} fontWeight={900}>30 px</text>
      <circle cx={476 + bw / 2} cy={104 + bh + 26} r={13}
        fill="color-mix(in srgb, var(--danger) 16%, transparent)" stroke="var(--danger)" strokeWidth={2} />
      <text x={476 + bw / 2} y={104 + bh + 32} textAnchor="middle"
        fill="var(--danger)" fontSize={14} fontWeight={950}>!</text>

      <rect x={148} y={418} width={504} height={26} rx={10}
        fill="color-mix(in srgb, var(--danger) 9%, var(--card))" stroke="var(--danger)" strokeWidth={1.5} />
      <text x={400} y={435} textAnchor="middle" fill="var(--danger)" fontSize={12} fontWeight={850}>border is unchanged — the cut position moved</text>
    </g>
  );
}
