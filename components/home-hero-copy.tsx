export function HomeHeroCopy() {
  return (
<<<<<<< HEAD
    <h1
      aria-live="polite"
      className={`min-h-[2.1em] max-w-4xl font-serif text-5xl font-bold leading-[1.02] tracking-tight text-foreground text-balance transition-opacity duration-200 sm:text-6xl lg:text-7xl ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      {lead}
      {ending && <span className="font-normal italic text-accent">{ending}</span>}
=======
    <h1 className="max-w-[850px] font-serif text-[3.5rem] font-semibold leading-[0.9] tracking-[-0.055em] text-foreground text-balance sm:text-[5rem] lg:text-[6.8rem]">
      Türkçeyi sesinden yapısına kadar <span className="font-normal italic text-accent">inceleyin.</span>
>>>>>>> 6f6b8925dff0a3ba59fd8f4ff3da6257267fd791
    </h1>
  )
}
