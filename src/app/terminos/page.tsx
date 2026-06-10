import { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Términos y Condiciones · SalesAI",
  description: "Condiciones de uso de SalesAI, la herramienta de asistencia de ventas de Sicoben Ediciones.",
};

export default function TerminosPage() {
  return (
    <LegalLayout
      title="Términos y Condiciones"
      updatedAt="10 de junio de 2026"
      otherLinks={[
        { href: "/privacidad", label: "Política de Privacidad" },
        { href: "/aviso-legal", label: "Aviso Legal" },
      ]}
    >
      <h2>1. Descripción del servicio</h2>
      <p>
        SalesAI es una herramienta de asistencia de ventas desarrollada para uso interno del equipo
        comercial de <strong>Sicoben Ediciones</strong>. Permite gestionar prospectos y clientes,
        generar mensajes y propuestas comerciales con inteligencia artificial, y registrar el
        seguimiento de la actividad de ventas desde Monday CRM como interfaz principal.
      </p>
      <p>
        El acceso a SalesAI está restringido exclusivamente al personal autorizado de Sicoben
        Ediciones.
      </p>

      <h2>2. Uso autorizado</h2>
      <p>Al usar SalesAI, el usuario se compromete a:</p>
      <ul>
        <li>Usar la herramienta únicamente en el contexto de su actividad comercial dentro de
          Sicoben Ediciones.</li>
        <li>No compartir sus credenciales de acceso con terceros.</li>
        <li>
          <strong>Revisar y aprobar cada mensaje antes de enviarlo.</strong> Ningún mensaje,
          email ni comunicación de WhatsApp generado por la IA se envía sin la aprobación
          explícita del vendedor responsable. Este principio es inviolable dentro del sistema.
        </li>
        <li>Registrar fielmente los resultados de llamadas y visitas presenciales en Monday CRM,
          ya que los informes se generan a partir de lo que está registrado.</li>
        <li>No usar la herramienta para contactar personas fuera del ámbito comercial de
          Sicoben.</li>
      </ul>

      <h2>3. Lo que la IA hace y lo que no hace</h2>
      <p>
        SalesAI usa modelos de inteligencia artificial (Anthropic Claude) para generar borradores
        de mensajes, propuestas y guiones. Estos son <strong>materiales de asistencia</strong>, no
        comunicaciones definitivas.
      </p>
      <p>El sistema:</p>
      <ul>
        <li><strong>Sí genera:</strong> textos de WhatsApp, emails, presentaciones PPTX, guiones
          de llamada, propuestas creativas en PDF y resúmenes de visitas.</li>
        <li>
          <strong>No automatiza llamadas:</strong> los guiones son orientativos; la llamada la
          realiza siempre el vendedor.
        </li>
        <li>
          <strong>No envía nada sin aprobación:</strong> todo mensaje queda en bandeja de
          revisión hasta que el vendedor lo aprueba.
        </li>
      </ul>

      <h2>4. Responsabilidad sobre el contenido enviado</h2>
      <p>
        El vendedor que aprueba y envía un mensaje es responsable de su contenido. Sicoben
        Ediciones no asume responsabilidad por comunicaciones enviadas sin la revisión adecuada
        del vendedor, por información incorrecta ingresada en el sistema, ni por el resultado de
        las interacciones comerciales.
      </p>
      <p>
        Los contenidos generados por IA pueden contener imprecisiones. Es responsabilidad del
        vendedor verificar que los datos del cliente (nombre, empresa, productos) sean correctos
        antes de aprobar cualquier mensaje.
      </p>

      <h2>5. Propiedad intelectual</h2>
      <p>
        Los mensajes, presentaciones y propuestas generados a través de SalesAI en el contexto
        del trabajo comercial de Sicoben son propiedad de <strong>Sicoben Ediciones</strong>.
      </p>
      <p>
        Las marcas y licencias de terceros mencionadas en los materiales (Disney, Mattel,
        Nickelodeon, BBC Studios, Universal y otras) son propiedad de sus respectivos titulares
        y se usan bajo los acuerdos de licencia vigentes entre Sicoben y dichos titulares.
      </p>
      <p>
        El software, diseño y código de SalesAI son propiedad de Sicoben Ediciones o de sus
        desarrolladores autorizados. Queda prohibida su reproducción o distribución sin
        autorización expresa.
      </p>

      <h2>6. Disponibilidad del servicio</h2>
      <p>
        Sicoben Ediciones se esfuerza por mantener SalesAI disponible en horario laboral
        (lunes a sábado, 7:00 a.m. – 8:00 p.m., hora de Panamá), pero no garantiza
        disponibilidad ininterrumpida. Pueden producirse interrupciones por mantenimiento
        programado, fallas en servicios de terceros (Monday, Anthropic, Vercel, Meta) o causas
        fuera de nuestro control. En esos casos, trabajaremos para restablecer el servicio a la
        brevedad.
      </p>

      <h2>7. Modificaciones al servicio y a estos términos</h2>
      <p>
        Sicoben Ediciones puede actualizar SalesAI o estos términos cuando sea necesario.
        Los cambios relevantes se comunicarán al equipo con al menos <strong>7 días de
        anticipación</strong>. El uso continuado de la herramienta después de esa fecha implica
        la aceptación de los nuevos términos.
      </p>

      <h2>8. Contacto</h2>
      <p>
        Para preguntas sobre el uso de la herramienta o estos términos, escribe a{" "}
        <a href="mailto:jenni.benarroch@sicobenediciones.com">
          jenni.benarroch@sicobenediciones.com
        </a>.
      </p>
    </LegalLayout>
  );
}
