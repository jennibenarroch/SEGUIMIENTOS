import { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Política de Privacidad · SalesAI",
  description: "Cómo Sicoben Ediciones trata los datos personales gestionados a través de SalesAI.",
};

export default function PrivacidadPage() {
  return (
    <LegalLayout
      title="Política de Privacidad"
      updatedAt="10 de junio de 2026"
      otherLinks={[
        { href: "/terminos", label: "Términos y Condiciones" },
        { href: "/aviso-legal", label: "Aviso Legal" },
      ]}
    >
      <h2>1. Quién es el responsable</h2>
      <p>
        <strong>Sicoben Ediciones</strong> es la responsable del tratamiento de los datos personales
        que se gestionan a través de SalesAI, nuestra herramienta interna de asistencia de ventas.
      </p>
      <p>
        Contacto para asuntos de privacidad:{" "}
        <a href="mailto:jenni.benarroch@sicobenediciones.com">
          jenni.benarroch@sicobenediciones.com
        </a>
      </p>

      <h2>2. Qué datos tratamos</h2>
      <p>SalesAI gestiona dos tipos de información:</p>
      <p>
        <strong>a) Datos de prospectos y clientes de Sicoben</strong> (personas de contacto en
        empresas con las que comerciamos o buscamos hacerlo):
      </p>
      <ul>
        <li>Nombre, cargo y empresa</li>
        <li>Email corporativo y número de WhatsApp de negocios</li>
        <li>País e idioma de preferencia</li>
        <li>Historial de comunicaciones con el equipo de ventas</li>
        <li>Historial de pedidos, propuestas y materiales enviados</li>
        <li>Registro de apertura de emails y propuestas (a través de links con seguimiento)</li>
      </ul>
      <p>
        <strong>b) Datos del equipo de ventas de Sicoben</strong> (usuarios internos de la
        herramienta):
      </p>
      <ul>
        <li>Nombre y correo electrónico corporativo</li>
        <li>Actividad registrada en la herramienta (mensajes aprobados, enviados y resultados
          anotados)</li>
      </ul>

      <h2>3. Para qué usamos los datos</h2>
      <ul>
        <li>Gestionar el proceso de prospección y seguimiento comercial</li>
        <li>Generar mensajes y propuestas personalizadas con inteligencia artificial</li>
        <li>Enviar comunicaciones comerciales previamente aprobadas por el vendedor responsable</li>
        <li>Registrar el historial de interacciones para dar continuidad a la relación comercial</li>
        <li>Generar informes internos de desempeño del equipo de ventas</li>
      </ul>

      <h2>4. Base legal del tratamiento</h2>
      <p>
        El tratamiento se realiza de acuerdo con la{" "}
        <strong>Ley 81 de 2019 de la República de Panamá</strong> sobre Protección de Datos
        Personales, bajo las siguientes bases legales:
      </p>
      <ul>
        <li>
          <strong>Ejecución de una relación comercial</strong> (Art. 9): tratamiento necesario
          para gestionar la relación entre Sicoben y sus clientes o potenciales clientes.
        </li>
        <li>
          <strong>Interés legítimo</strong> (Art. 9): gestión interna de la actividad comercial
          de la empresa, incluyendo el seguimiento de oportunidades de negocio.
        </li>
        <li>
          <strong>Consentimiento</strong> (Art. 9): cuando el tratamiento no esté cubierto por
          las bases anteriores, solicitamos el consentimiento expreso del interesado.
        </li>
      </ul>

      <h2>5. Con quién compartimos los datos</h2>
      <p>
        SalesAI utiliza los siguientes servicios de terceros que procesan datos en nombre de
        Sicoben Ediciones:
      </p>
      <table>
        <thead>
          <tr>
            <th>Proveedor</th>
            <th>Función</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Anthropic (Claude AI)</td>
            <td>Generación de textos, propuestas y guiones con inteligencia artificial</td>
          </tr>
          <tr>
            <td>Monday.com</td>
            <td>Plataforma CRM donde se almacenan los datos de clientes y prospectos</td>
          </tr>
          <tr>
            <td>Resend</td>
            <td>Envío de correos electrónicos comerciales</td>
          </tr>
          <tr>
            <td>Meta (WhatsApp Business API)</td>
            <td>Envío de mensajes de WhatsApp a clientes y prospectos</td>
          </tr>
          <tr>
            <td>Vercel</td>
            <td>Hospedaje e infraestructura de la aplicación</td>
          </tr>
        </tbody>
      </table>
      <p>
        Ninguno de estos proveedores vende ni utiliza los datos para fines propios distintos a
        prestar el servicio contratado.
      </p>

      <h2>6. Cuánto tiempo conservamos los datos</h2>
      <p>
        Los datos de prospectos y clientes se conservan mientras la relación comercial esté activa.
        Cuando un deal se cierra o archiva, la información se retiene por un máximo de{" "}
        <strong>3 años</strong> para fines de historial y auditoría interna, salvo que el interesado
        solicite su eliminación antes de ese plazo.
      </p>
      <p>
        Los registros de actividad del equipo de ventas se conservan por el mismo período.
      </p>

      <h2>7. Tus derechos</h2>
      <p>
        Bajo la Ley 81 de 2019 de Panamá, toda persona tiene derecho a:
      </p>
      <ul>
        <li>
          <strong>Acceso:</strong> conocer qué datos personales suyos tratamos y con qué finalidad.
        </li>
        <li>
          <strong>Rectificación:</strong> corregir datos inexactos o desactualizados.
        </li>
        <li>
          <strong>Cancelación:</strong> solicitar que eliminemos sus datos cuando ya no sean
          necesarios para el fin para el que fueron recopilados.
        </li>
        <li>
          <strong>Oposición:</strong> oponerse al tratamiento en las circunstancias previstas por
          la ley.
        </li>
      </ul>
      <p>
        Para ejercer cualquiera de estos derechos, escríbenos a{" "}
        <a href="mailto:jenni.benarroch@sicobenediciones.com">
          jenni.benarroch@sicobenediciones.com
        </a>{" "}
        indicando tu nombre, el derecho que deseas ejercer y, si aplica, los datos específicos a
        los que se refiere tu solicitud. Responderemos en un plazo máximo de 30 días hábiles.
      </p>

      <h2>8. Seguridad</h2>
      <p>
        Implementamos medidas técnicas y organizativas para proteger los datos contra acceso no
        autorizado, pérdida, alteración o divulgación indebida. Estas medidas incluyen control de
        acceso por roles, autenticación de usuarios y transmisión cifrada de datos. No obstante,
        ningún sistema es completamente infalible; en caso de incidente que afecte tus datos, lo
        comunicaremos conforme a la ley.
      </p>

      <h2>9. Cambios a esta política</h2>
      <p>
        Podemos actualizar esta política para reflejar cambios en nuestras prácticas o en la
        normativa aplicable. La fecha de última actualización siempre aparece al inicio del
        documento. Si los cambios son sustanciales, lo notificaremos al equipo interno de Sicoben
        con anticipación razonable.
      </p>
    </LegalLayout>
  );
}
