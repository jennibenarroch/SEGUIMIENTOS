import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://salesai.sicobenediciones.com";

export const metadata: Metadata = {
  title: "Aviso Legal",
  description:
    "Información legal sobre SalesAI y Sicoben Ediciones: titularidad, propiedad intelectual, exención de responsabilidad y ley aplicable.",
  alternates: { canonical: `${APP_URL}/aviso-legal` },
  openGraph: {
    type: "website",
    url: `${APP_URL}/aviso-legal`,
    siteName: "SalesAI",
    locale: "es_PA",
    title: "Aviso Legal · SalesAI",
    description:
      "Información legal sobre SalesAI y Sicoben Ediciones: titularidad, propiedad intelectual y ley aplicable.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "SalesAI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aviso Legal · SalesAI",
    description: "Información legal sobre SalesAI y Sicoben Ediciones.",
    images: ["/opengraph-image"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${APP_URL}/aviso-legal`,
  name: "Aviso Legal · SalesAI",
  description:
    "Información legal sobre SalesAI y Sicoben Ediciones: titularidad, propiedad intelectual y ley aplicable.",
  url: `${APP_URL}/aviso-legal`,
  inLanguage: "es",
  dateModified: "2026-06-10",
  publisher: {
    "@type": "Organization",
    name: "Sicoben Ediciones",
    email: "jenni.benarroch@sicobenediciones.com",
  },
  isPartOf: { "@id": `${APP_URL}/#webapp` },
};

export default function AvisoLegalPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LegalLayout
      title="Aviso Legal"
      updatedAt="10 de junio de 2026"
      otherLinks={[
        { href: "/privacidad", label: "Política de Privacidad" },
        { href: "/terminos", label: "Términos y Condiciones" },
      ]}
    >
      <h2>1. Identificación del titular</h2>
      <p>
        La presente herramienta, <strong>SalesAI</strong>, es desarrollada y operada por:
      </p>
      <ul>
        <li><strong>Nombre comercial:</strong> Sicoben Ediciones</li>
        <li><strong>País de operación:</strong> República de Panamá</li>
        <li>
          <strong>Correo de contacto:</strong>{" "}
          <a href="mailto:jenni.benarroch@sicobenediciones.com">
            jenni.benarroch@sicobenediciones.com
          </a>
        </li>
      </ul>

      <h2>2. Objeto</h2>
      <p>
        El presente aviso legal regula el acceso y uso de SalesAI, herramienta de asistencia de
        ventas para uso interno del equipo comercial de Sicoben Ediciones. SalesAI no es un
        servicio público ni está disponible para usuarios externos a la empresa.
      </p>

      <h2>3. Propiedad intelectual</h2>
      <p>
        El software, código fuente, diseño visual, arquitectura y documentación de SalesAI son
        propiedad de Sicoben Ediciones o están sujetos a acuerdos de licencia con sus
        desarrolladores. Queda estrictamente prohibida su reproducción, distribución, modificación
        o comunicación pública sin autorización escrita previa.
      </p>
      <p>
        Las marcas comerciales, logotipos y nombres de terceros que aparecen en SalesAI
        (Disney, Mattel, Nickelodeon, BBC Studios, Universal, Monday.com, Meta, entre otros)
        son propiedad de sus respectivos titulares y se mencionan únicamente en el contexto
        operativo de la herramienta.
      </p>

      <h2>4. Exención de responsabilidad</h2>
      <p>
        Sicoben Ediciones no se responsabiliza por:
      </p>
      <ul>
        <li>Interrupciones, errores o indisponibilidades de los servicios de terceros integrados
          (Anthropic, Monday.com, Meta, Resend, Vercel).</li>
        <li>Pérdida de datos derivada de fallos en dichos servicios de terceros.</li>
        <li>Contenido generado por la inteligencia artificial que haya sido modificado,
          malinterpretado o enviado sin la revisión adecuada del vendedor responsable.</li>
        <li>Daños derivados del uso indebido de la herramienta por parte de usuarios no
          autorizados o por uso fuera de los fines para los que fue diseñada.</li>
      </ul>

      <h2>5. Protección de datos</h2>
      <p>
        El tratamiento de datos personales gestionados a través de SalesAI se rige por nuestra{" "}
        <a href="/privacidad">Política de Privacidad</a> y por la{" "}
        <strong>Ley 81 de 2019 de la República de Panamá</strong> sobre Protección de Datos
        Personales.
      </p>

      <h2>6. Cookies y rastreo</h2>
      <p>
        SalesAI es una aplicación de uso interno que no utiliza cookies de rastreo publicitario
        ni perfiles de comportamiento externos. Los links con seguimiento incluidos en propuestas
        y emails comerciales tienen como único propósito notificar al vendedor responsable si el
        destinatario abrió el material enviado, en el contexto de la gestión comercial de Sicoben.
      </p>

      <h2>7. Ley aplicable y jurisdicción</h2>
      <p>
        El presente aviso legal y el uso de SalesAI se rigen por las leyes de la{" "}
        <strong>República de Panamá</strong>. Para cualquier controversia o reclamación derivada
        del uso de la herramienta, las partes se someten a la jurisdicción de los tribunales
        competentes de la Ciudad de Panamá, renunciando expresamente a cualquier otro fuero que
        pudiera corresponderles.
      </p>

      <h2>8. Contacto</h2>
      <p>
        Para cualquier consulta legal relacionada con SalesAI o con Sicoben Ediciones, puedes
        escribirnos a{" "}
        <a href="mailto:jenni.benarroch@sicobenediciones.com">
          jenni.benarroch@sicobenediciones.com
        </a>.
      </p>
    </LegalLayout>
    </>
  );
}
