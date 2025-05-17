import Image from "next/image"

export function Header() {
  return (
    <header className="flex justify-center py-6 px-4">
      <div className="w-48 h-auto">
        <Image
          src="/images/logo.png"
          alt="It's Open Logo"
          width={240}
          height={120}
          priority
          className="w-full h-auto"
        />
      </div>
    </header>
  )
}
