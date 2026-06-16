import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://salesai.sicobenediciones.com";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description:
    "Qué cookies usa SalesAI, para qué sirven y cómo gestionarlas: cookies necesarias, analítica y preferencias.",
  alternates: { canonical: `${APP_URL}/cookies` },
  openGraph: {
    type: "website",
    url: `${APP_URL}/cookies`,
    siteName: "SalesAI",
    locale: "es_PA",
    title: "Política de Cookies · SalesAI",
    description: "Qué cookies usa SalesAI, para qué sirven y cómo puedes gestionarlas.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "SalesAI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Política de Cookies · SalesAI",
    description: "Qué cookies usa SalesAI, para qué sirven y cómo gestionarlas.",
    images: ["/opengraph-image"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${APP_URL}/cookies`,
  name: "Política de Cookies · SalesAI",
  description: "Qué cookies usa SalesAI, para qué sirven y cómo gestionarlas.",
  url: `${APP_URL}/cookies`,
  inLanguage: "es",
  dateModified: "2026-06-10",
  publisher: {
    "@type": "Organization",
    name: "Sicoben Ediciones",
    email: "jenni.benarroch@sicobenediciones.com",
  },
  isPartOf: { "@id": `${APP_URL}/#webapp` },
};

export default function CookiesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LegalLayout
      title="Política de Cookies"
      updatedAt="10 de junio de 2026"
      otherLinks={[
        { href: "/privacidad", label: "Política de Privacidad" },
        { href: "/terminos", label: "Términos y Condiciones" },
        { href: "/aviso-legal", label: "Aviso Legal" },
      ]}
    >
      <h2>1. ¿Qué son las cookies?</h2>
      <p>
        Las cookies son pequeños archivos de texto que los sitios web guardan en tu navegador cuando
        los visitas. Permiten que el sitio recuerde información sobre tu visita —como tus preferencias
        o el estado de tu sesión— para que la próxima visita sea más cómoda y el sitio funcione
        correctamente.
      </p>

      <h2>2. ¿Quién es el responsable?</h2>
      <p>
        <strong>Sicoben Ediciones</strong> es responsable del uso de cookies en SalesAI.
        Para cualquier consulta, escríbenos a{" "}
        <a href="mailto:jenni.benarroch@sicobenediciones.com">
          jenni.benarroch@sicobenediciones.com
        </a>
        .
      </p>

      <h2>3. Tipos de cookies que usamos</h2>

      <p>
        <strong>3.1 Cookies estrictamente necesarias</strong>
      </p>
      <p>
        Son imprescindibles para que el sitio funcione. Sin ellas no puedes iniciar sesión ni
        navegar de forma segura. No requieren tu consentimiento.
      </p>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Proveedor</th>
            <th>Finalidad</th>
            <th>Duración</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>salesai_vendor</code></td>
            <td>SalesAI (propio)</td>
            <td>Recuerda el nombre del vendedor activo en la sesión</td>
            <td>Sesión</td>
          </tr>
          <tr>
            <td><code>salesai_cookie_consent</code></td>
            <td>SalesAI (propio)</td>
            <td>Guarda tus preferencias de cookies para no volver a preguntarte</td>
            <td>1 año</td>
          </tr>
          <tr>
            <td><code>__cf_bm</code></td>
            <td>Cloudflare / Vercel</td>
            <td>Protección contra bots y gestión de carga del servidor</td>
            <td>30 minutos</td>
          </tr>
        </tbody>
      </table>

      <p>
        <strong>3.2 Cookies de analítica</strong>
      </p>
      <p>
        Nos ayudan a entender cómo se usa el sitio: qué páginas se visitan más, cuánto tiempo se
        permanece en ellas y desde dónde llegan los usuarios. Solo se activan si das tu
        consentimiento.
      </p>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Proveedor</th>
            <th>Finalidad</th>
            <th>Duración</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>_ga</code></td>
            <td>Google Analytics</td>
            <td>Distingue usuarios únicos para estadísticas de uso</td>
            <td>2 años</td>
          </tr>
          <tr>
            <td><code>_ga_*</code></td>
            <td>Google Analytics</td>
            <td>Mantiene el estado de la sesión en Analytics 4</td>
            <td>2 años</td>
          </tr>
        </tbody>
      </table>
      <p>
        Actualmente <strong>no tenemos Analytics activo</strong>. Esta tabla se actualiza en el
        momento en que se active cualquier servicio de analítica.
      </p>

      <p>
        <strong>3.3 Cookies de marketing</strong>
      </p>
      <p>
        Permiten mostrar publicidad personalizada en función de tu navegación. Solo se activan con
        tu consentimiento explícito.
      </p>
      <p>
        Actualmente <strong>no usamos cookies de marketing</strong>. Si en el futuro las
        incorporamos, actualizaremos esta política y solicitaremos tu consentimiento de nuevo.
      </p>

      <h2>4. Cookies de terceros</h2>
      <p>
        Algunos de los servicios que integra SalesAI pueden instalar sus propias cookies cuando
        interactúas con ellos:
      </p>
      <ul>
        <li>
          <strong>Vercel / Cloudflare:</strong> cookies técnicas de infraestructura necesarias para
          servir la aplicación de forma segura.
        </li>
        <li>
          <strong>Monday.com:</strong> cuando accedes al board de Monday desde un enlace dentro de
          SalesAI, Monday puede instalar sus propias cookies bajo su política de privacidad.
        </li>
      </ul>
      <p>
        Sicoben Ediciones no controla las cookies de terceros. Te recomendamos consultar las
        políticas de privacidad de cada proveedor para más información.
      </p>

      <h2>5. Cómo gestionar tus preferencias</h2>
      <p>
        Puedes cambiar tus preferencias de cookies en cualquier momento de dos formas:
      </p>
      <ul>
        <li>
          <strong>Desde el banner de cookies:</strong> si limpias los datos del sitio en tu
          navegador, el banner volverá a aparecer y podrás elegir de nuevo.
        </li>
        <li>
          <strong>Desde tu navegador:</strong> todos los navegadores modernos permiten ver, bloquear
          o eliminar las cookies almacenadas. Consulta la ayuda de tu navegador para saber cómo
          hacerlo (Chrome, Firefox, Safari, Edge).
        </li>
      </ul>
      <p>
        Ten en cuenta que bloquear las cookies necesarias puede impedir que el sitio funcione
        correctamente.
      </p>

      <h2>6. Base legal</h2>
      <p>
        El uso de cookies necesarias se basa en el <strong>interés legítimo</strong> para el
        funcionamiento del servicio. El uso de cookies de analítica y marketing se basa en el{" "}
        <strong>consentimiento explícito</strong> que otorgas a través del banner. Puedes retirar
        ese consentimiento en cualquier momento sin que ello afecte a la licitud del tratamiento
        previo a la retirada.
      </p>

      <h2>7. Actualizaciones de esta política</h2>
      <p>
        Podemos actualizar esta política cuando incorporemos nuevos servicios o herramientas que
        impliquen el uso de cookies adicionales. La fecha de última actualización aparece siempre
        al inicio del documento. Si los cambios afectan a categorías de cookies que requieren
        consentimiento, te lo notificaremos mostrando el banner de nuevo.
      </p>

      <h2>8. Contacto</h2>
      <p>
        Para cualquier duda sobre el uso de cookies, escríbenos a{" "}
        <a href="mailto:jenni.benarroch@sicobenediciones.com">
          jenni.benarroch@sicobenediciones.com
        </a>
        .
      </p>
    </LegalLayout>
    </>
  );
}
