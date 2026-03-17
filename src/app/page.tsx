import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

// Accessible form component — labels properly associated
function ContactForm() {
  return (
    <form
      aria-label="Contact form"
      className="flex flex-col gap-4 max-w-md"
      // In a real app this would be a Server Action or API call
      action="#"
      method="POST"
    >
      <div className="flex flex-col gap-1">
        {/*
          INTENTIONAL VIOLATION: Missing 'htmlFor' attribute.
          WCAG 2.1 SC 1.3.1: Info and Relationships
          Because this label doesn't wrap the input AND lacks 'htmlFor',
          assistive technology cannot link the text "Full Name" to the field.
        */}
        <label className="font-semibold text-slate-700">
          Full Name{" "}
          <span aria-hidden="true" className="text-red-600">
            *
          </span>
          <span className="sr-only">(required)</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          aria-required="true"
          className="border border-slate-300 rounded px-3 py-2 "
        />
      </div>

      <div className="flex flex-col gap-1">
        {/*
          INTENTIONAL VIOLATION: Missing 'htmlFor' attribute.
          Assistive technology will just announce "Edit text, required"
          instead of "Email Address, Edit text, required".
        */}
        <label className="font-semibold text-slate-700">
          Email Address{" "}
          <span aria-hidden="true" className="text-red-600">
            *
          </span>
          <span className="sr-only">(required)</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-required="true"
          className="border border-slate-300 rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        {/*
          INTENTIONAL VIOLATION: Missing 'htmlFor' attribute.
        */}
        <label className="font-semibold text-slate-700">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="border border-slate-300 rounded px-3 py-2 "
        />
      </div>

      <button
        type="submit"
        className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 "
      >
        Send Message
      </button>
    </form>
  );
}

// Accessible image gallery with real alt text
function ImageGallery() {
  const images = [
    {
      src: "https://picsum.photos/seed/cat/400/300",
      alt: "A fluffy orange cat sitting on a wooden bench in a sunlit garden",
    },
    {
      src: "https://picsum.photos/seed/mountain/400/300",
      /*
        INTENTIONAL VIOLATION: Missing 'alt' attribute.
        WCAG 2.1 SC 1.1.1: Non-text Content
        Axe-core will identify this as a critical failure.
      */
    },
    {
      src: "https://picsum.photos/seed/city/400/300",
      alt: "Aerial view of a busy city intersection at night with light trails",
    },
  ];

  return (
    <section aria-labelledby="gallery-heading" className="mt-10">
      <h2 id="gallery-heading" className="text-xl font-bold mb-4">
        Photo Gallery
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 list-none p-0">
        {images.map((img) => (
          <li key={img.src}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt} // Descriptive alt — required by jsx-a11y/alt-text
              width={400}
              height={300}
              className="rounded w-full object-cover"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      {/* h1 is required — axe checks for a page-level heading */}
      <h1 className="text-3xl font-bold mb-2">Welcome to A11y Next App</h1>
      <p className="text-slate-600 mb-8 max-w-prose">
        This project demonstrates WCAG 2.2 AA compliant patterns in Next.js,
        enforced by static linting and automated axe-core tests.
      </p>

      <section aria-labelledby="contact-heading">
        <h2 id="contact-heading" className="text-xl font-bold mb-4">
          Get in Touch
        </h2>
        <ContactForm />
      </section>

      <ImageGallery />
    </>
  );
}
