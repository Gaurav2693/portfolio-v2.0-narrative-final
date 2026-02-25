import svgPaths from "./svg-3jz3gn2m8a";

function Icon() {
  return (
    <div className="absolute left-[6.5px] size-[11px] top-[6.5px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 11">
        <g clipPath="url(#clip0_17045_479)" id="Icon">
          <path d="M6.875 1.375H9.625V4.125" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="0.916667" />
          <path d="M4.125 9.625H1.375V6.875" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="0.916667" />
          <path d="M9.625 1.375L6.41667 4.58333" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="0.916667" />
          <path d="M1.375 9.625L4.58333 6.41667" id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3" strokeWidth="0.916667" />
        </g>
        <defs>
          <clipPath id="clip0_17045_479">
            <rect fill="white" height="11" width="11" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] border-solid left-[254px] rounded-[7px] size-[26px] top-[17px]" data-name="Button">
      <Icon />
    </div>
  );
}

function Container1() {
  return <div className="absolute bg-gradient-to-r from-[rgba(255,255,255,0.06)] h-px left-[20px] to-[rgba(255,255,255,0.02)] top-[138px] w-[268px]" data-name="Container" />;
}

function Paragraph() {
  return <div className="absolute h-[57px] left-0 top-0 w-[268px]" data-name="Paragraph" />;
}

function Container2() {
  return (
    <div className="absolute h-[95.5px] left-[20px] top-[151px] w-[268px]" data-name="Container">
      <Paragraph />
    </div>
  );
}

function Container3() {
  return <div className="absolute bg-gradient-to-r from-[rgba(255,255,255,0.06)] h-px left-[20px] to-[rgba(255,255,255,0.02)] top-[260.5px] w-[268px]" data-name="Container" />;
}

function Icon1() {
  return (
    <div className="absolute left-[10px] size-[11px] top-[7.75px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 11">
        <g clipPath="url(#clip0_17045_457)" id="Icon">
          <path d={svgPaths.p2218e600} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4" strokeWidth="0.913846" />
          <path d={svgPaths.p34047700} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4" strokeWidth="0.913846" />
        </g>
        <defs>
          <clipPath id="clip0_17045_457">
            <rect fill="white" height="11" width="11" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="absolute h-[16.5px] left-[26px] top-[5px] w-[25.719px]" data-name="Text">
      <p className="-translate-x-1/2 absolute font-['Cambay:Regular',sans-serif] leading-[16.5px] left-[13px] not-italic text-[11px] text-[rgba(255,255,255,0.65)] text-center top-0">Email</p>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.35)] border-solid h-[28.5px] left-0 rounded-[7px] top-0 w-[63.719px]" data-name="Button">
      <Icon1 />
      <Text />
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[10px] size-[11px] top-[7.75px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 11">
        <g clipPath="url(#clip0_17045_464)" id="Icon">
          <path d={svgPaths.pb949880} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4" strokeWidth="0.913846" />
          <path d={svgPaths.p321ab280} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4" strokeWidth="0.913846" />
          <path d="M5.5 6.875V1.375" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4" strokeWidth="0.913846" />
        </g>
        <defs>
          <clipPath id="clip0_17045_464">
            <rect fill="white" height="11" width="11" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text1() {
  return (
    <div className="absolute h-[16.5px] left-[26px] top-[5px] w-[37.656px]" data-name="Text">
      <p className="absolute font-['Cambay:Regular',sans-serif] leading-[16.5px] left-0 not-italic text-[11px] text-[rgba(255,255,255,0.65)] top-0">Resume</p>
    </div>
  );
}

function Link() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.35)] border-solid h-[28.5px] left-[71.72px] rounded-[7px] top-0 w-[75.656px]" data-name="Link">
      <Icon2 />
      <Text1 />
    </div>
  );
}

function Container5() {
  return <div className="absolute h-0 left-[155.38px] top-[14.25px] w-[4.625px]" data-name="Container" />;
}

function Icon3() {
  return (
    <div className="absolute left-[7px] size-[12px] top-[7px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p15126280} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9" />
          <path d="M3 4.5H1V10.5H3V4.5Z" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9" />
          <path d={svgPaths.p22b49200} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9" />
        </g>
      </svg>
    </div>
  );
}

function Link1() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.04)] border-solid left-[168px] rounded-[6px] size-[28px] top-[0.25px]" data-name="Link">
      <Icon3 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute left-[7px] size-[12px] top-[7px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_17045_469)" id="Icon">
          <path d={svgPaths.p6a70d00} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9" />
          <path d={svgPaths.p4280} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9" />
          <path d="M8.74997 3.25H8.75587" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9" />
        </g>
        <defs>
          <clipPath id="clip0_17045_469">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Link2() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.04)] border-solid left-[204px] rounded-[6px] size-[28px] top-[0.25px]" data-name="Link">
      <Icon4 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="absolute left-[7px] size-[12px] top-[7px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.pa85bf0} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9" />
        </g>
      </svg>
    </div>
  );
}

function Link3() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.04)] border-solid left-[240px] rounded-[6px] size-[28px] top-[0.25px]" data-name="Link">
      <Icon5 />
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute h-[28.5px] left-[20px] top-[353px] w-[268px]" data-name="Container">
      <Button1 />
      <Link />
      <Container5 />
      <Link1 />
      <Link2 />
      <Link3 />
    </div>
  );
}

function MyPersonalUltraCompact() {
  return (
    <div className="absolute h-[64px] left-0 overflow-clip top-0 w-[308px]" data-name="My Personal Ultra compact">
      <Button />
      <Container1 />
      <Container2 />
      <Container3 />
      <Container4 />
      <p className="absolute font-['Bebas_Neue:Regular',sans-serif] leading-[28px] left-[20px] not-italic text-[32px] text-white top-[17px] tracking-[0.5px]">My personal</p>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-gradient-to-b border border-[rgba(255,255,255,0.06)] border-solid from-[rgba(0,40,38,0.92)] overflow-clip relative rounded-[18px] size-full to-[40%] to-[rgba(6,6,6,0.95)]" data-name="Container">
      <MyPersonalUltraCompact />
    </div>
  );
}