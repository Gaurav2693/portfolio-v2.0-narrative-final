import svgPaths from "./svg-7dnvql5jdj";

function Group() {
  return (
    <div className="absolute inset-[31.51%_45.46%_51.42%_43.06%]" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 198.448 190.619">
        <g id="Group">
          <path d={svgPaths.p262f6100} fill="var(--fill-0, #FAF9F7)" id="Vector" />
          <path d={svgPaths.p35290000} fill="var(--fill-0, #21BE97)" id="Vector_2" />
          <path d={svgPaths.p3a49d800} fill="var(--fill-0, #21BE97)" id="Vector_3" />
          <path d={svgPaths.p3d89ca80} fill="var(--fill-0, #FAF9F7)" id="Vector_4" />
          <path d={svgPaths.p295e3c80} fill="var(--fill-0, #29CFD8)" id="Vector_5" />
        </g>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-[56.94%_32.93%_37.87%_30.5%]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 631.998 57.9999">
        <g id="Group 1">
          <path d={svgPaths.p25f48000} fill="var(--fill-0, #3964A2)" id="Vector" />
          <path d={svgPaths.p115f6400} fill="var(--fill-0, #1E2665)" id="Vector_2" />
          <path d={svgPaths.padd6f00} fill="var(--fill-0, #FAF9F7)" id="Vector_3" />
          <path d={svgPaths.pb041980} fill="var(--fill-0, #21BE97)" id="Vector_4" />
        </g>
      </svg>
    </div>
  );
}

export default function LoadingAnimation() {
  return (
    <div className="bg-[#1a1a1a] relative size-full" data-name="Loading animation 1">
      <Group />
      <Group1 />
      <p className="-translate-x-1/2 absolute font-['Bebas_Neue:Regular',sans-serif] h-[25px] leading-[normal] left-[calc(50%-21px)] not-italic text-[32px] text-center text-white top-[574px] w-[342px] whitespace-pre-wrap">Portfolio Systems Loading...</p>
    </div>
  );
}