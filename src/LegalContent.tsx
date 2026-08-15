import React from "react";
import styles from "./Landing.module.css";

export const LegalContent: React.FC<{ page: "privacidad" | "terminos" | "cookies" | "envios" }> = ({ page }) => {
  if (page === "privacidad") {
    return (
      <section className={styles.aboutSection}>
        <div className={styles.aboutContent}>
          <span className={styles.eyebrow}>LEGAL</span>
          <h1>Aviso de Privacidad Integral</h1>
          <p>NVX TECHNOLOGIES, S. DE R.L. DE C.V. — MOVINEX  ·  Vigente a partir del 6 de agosto de 2026</p>
          
          <h3>1. Identidad y domicilio del Responsable</h3>
          <p>NVX TECHNOLOGIES, S. DE R.L. DE C.V., que opera comercialmente bajo la marca MOVINEX (en adelante, "Movinex", "nosotros" o el "Responsable"), con Registro Federal de Contribuyentes NTE2603034X5 y domicilio en Calle Bosque de Arrayán número exterior 1, interior LT 1 417, Colonia Bosque Esmeralda, Ciudad López Mateos, Atizapán de Zaragoza, Estado de México, C.P. 52930, es responsable del tratamiento de sus datos personales.</p>
          <p>Este Aviso se emite en cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), publicada en el Diario Oficial de la Federación el 20 de marzo de 2025, y su normativa aplicable.</p>

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px", marginBottom: "24px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Canal</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Dato</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Sitio web</td><td style={{ padding: "12px" }}><a href="https://movinex.mx" target="_blank" rel="noreferrer">https://movinex.mx</a></td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Privacidad y derechos ARCO</td><td style={{ padding: "12px" }}>privacidad@movinex.mx</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Atención general</td><td style={{ padding: "12px" }}>info@movinex.mx</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Teléfono y WhatsApp</td><td style={{ padding: "12px" }}>55 5502 8744</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Área responsable</td><td style={{ padding: "12px" }}>Departamento de Privacidad</td></tr>
            </tbody>
          </table>

          <h3>2. Datos personales que tratamos</h3>
          <p>Para las finalidades descritas en este Aviso, recabamos las siguientes categorías de datos personales:</p>
          
          <h4>2.1 Datos de identificación</h4>
          <p>Nombre completo, Clave Única de Registro de Población (CURP), Registro Federal de Contribuyentes (cuando aplique), fecha de nacimiento, nacionalidad, género, firma autógrafa digitalizada, e imágenes del anverso y reverso de su credencial para votar u otra identificación oficial vigente.</p>
          
          <h4>2.2 Datos de contacto</h4>
          <p>Domicilio particular y domicilio de entrega, correo electrónico, número de teléfono móvil y número de WhatsApp.</p>
          
          <h4>2.3 Datos biométricos — DATOS PERSONALES SENSIBLES</h4>
          <p>Imagen facial (fotografía tipo selfie), plantilla biométrica derivada de dicha imagen y resultado de la prueba de vida, obtenidos a través de nuestro proveedor de verificación de identidad.</p>
          
          <h4>2.4 Datos financieros y patrimoniales</h4>
          <p>Datos de la tarjeta de débito o crédito con la que realiza su pago inicial —los cuales son capturados y resguardados de forma tokenizada directamente por nuestros procesadores de pago, sin que Movinex almacene el número completo de su tarjeta—, ingresos declarados, ocupación, cuenta CLABE única asignada a su operación y datos de las transferencias que realice a la misma —incluyendo institución bancaria y cuenta ordenante—, historial de pagos con Movinex y saldos pendientes.</p>
          
          <h4>2.5 Datos del equipo financiado</h4>
          <p>Número IMEI, número de serie, marca, modelo, estado de activación y estado de bloqueo del dispositivo, así como identificadores técnicos generados por el software de bloqueo instalado en el equipo.</p>
          
          <h4>2.6 Datos de navegación y uso</h4>
          <p>Dirección IP, tipo de navegador y dispositivo, sistema operativo, páginas visitadas, identificadores de cookies y de publicidad, e interacciones con nuestros anuncios y mensajes.</p>
          
          <p>No recabamos datos personales sensibles distintos a los biométricos señalados en el numeral 2.3. En particular, no recabamos datos sobre origen racial o étnico, estado de salud, información genética, creencias religiosas, filosóficas o morales, afiliación sindical, opiniones políticas ni preferencia sexual.</p>

          <h3>3. Finalidades del tratamiento</h3>
          
          <h4>3.1 Finalidades necesarias</h4>
          <p>Estas finalidades son indispensables para la existencia y cumplimiento de la relación jurídica entre usted y Movinex. Sin ellas no podemos prestarle el servicio:</p>
          <ul>
            <li>Verificar su identidad y validar la autenticidad de su identificación oficial, incluyendo la comparación biométrica de su rostro contra la fotografía de dicha identificación.</li>
            <li>Prevenir, detectar e investigar el fraude, la suplantación de identidad y el uso indebido de nuestros servicios.</li>
            <li>Evaluar su solicitud y determinar la aprobación, el monto, el plazo y las condiciones del financiamiento, mediante procesos que incluyen decisiones automatizadas conforme al numeral 4 de este Aviso.</li>
            <li>Celebrar, formalizar, documentar y ejecutar el contrato de compraventa a plazos del equipo, así como sus anexos y demás documentos accesorios.</li>
            <li>Procesar el pago inicial a su medio de pago, asignarle una cuenta CLABE única y recibir, identificar, aplicar y conciliar los pagos semanales que usted realice a dicha cuenta.</li>
            <li>Gestionar la logística de envío y entrega del equipo, así como las incidencias de entrega.</li>
            <li>Activar, administrar, operar y, en su momento, desactivar el Servicio de Seguridad y Bloqueo del Equipo contratado por usted, incluyendo el bloqueo y desbloqueo remoto del dispositivo conforme a lo pactado.</li>
            <li>Realizar gestiones de cobranza extrajudicial y, en su caso, ejercer las acciones judiciales que correspondan.</li>
            <li>Atender sus solicitudes, dudas, quejas, reclamaciones y trámites de garantía.</li>
            <li>Dar cumplimiento a las obligaciones que nos imponen la Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita y su normativa derivada, incluyendo la integración de expedientes de identificación y la presentación de avisos ante las autoridades competentes.</li>
            <li>Cumplir con nuestras obligaciones fiscales, contables y de conservación documental.</li>
            <li>Administrar nuestras listas internas de control y prevención de riesgo.</li>
          </ul>

          <h4>3.2 Finalidades voluntarias</h4>
          <p>Estas finalidades no son necesarias para la relación jurídica. Usted puede negarse a ellas sin que ello afecte en modo alguno la evaluación de su solicitud ni las condiciones de su financiamiento:</p>
          <ul>
            <li>Enviarle publicidad, promociones, ofertas y novedades comerciales de Movinex por correo electrónico, WhatsApp, mensajes de texto, llamadas telefónicas y redes sociales.</li>
            <li>Incluir sus datos en audiencias personalizadas y segmentaciones publicitarias en plataformas digitales de terceros.</li>
            <li>Realizar encuestas de satisfacción, estudios de mercado y análisis estadístico con fines de mejora comercial.</li>
          </ul>
          <p>Cómo negarse. Si no desea que sus datos se traten para estas finalidades, puede manifestarlo en cualquier momento enviando un correo a privacidad@movinex.mx con el asunto "Negativa a finalidades voluntarias", o desmarcando la casilla correspondiente durante el proceso de contratación. También puede inscribirse en el Registro Público para Evitar Publicidad (REPEP) de la Procuraduría Federal del Consumidor.</p>

          <h3>4. Decisiones automatizadas y elaboración de perfiles</h3>
          <p>Movinex utiliza sistemas automatizados para evaluar las solicitudes de financiamiento. Queremos que entienda con claridad cómo funciona:</p>
          <p>Qué hacemos. Al recibir su solicitud, nuestros sistemas analizan de forma automática la información que usted nos proporciona y la que se genera durante el proceso, y producen una decisión de aprobación o rechazo, así como el plazo y las condiciones que podemos ofrecerle.</p>
          <p>Qué información se utiliza. Principalmente: el resultado de la verificación de identidad y de la comparación biométrica; la consistencia y validez de sus datos de contacto e identificación; su comportamiento durante el proceso de solicitud; su historial previo de pagos con Movinex, si lo tiene; y la coincidencia con nuestras listas internas de prevención de fraude.</p>
          <p>Qué no utilizamos. Movinex no consulta sociedades de información crediticia (buró de crédito). La evaluación se realiza exclusivamente con métricas propias.</p>
          <p>Consecuencias para usted. El resultado determina si su solicitud es aprobada o rechazada y, en caso de aprobación, el plazo y las condiciones aplicables. Un rechazo no implica ningún registro negativo ante terceros.</p>
          <p>Sus derechos frente a estas decisiones. Usted tiene derecho a: (i) solicitar que le expliquemos, en lenguaje sencillo, la lógica general aplicada a su caso; (ii) obtener la intervención de una persona por parte de Movinex que revise la decisión; (iii) expresar su punto de vista; y (iv) impugnar la decisión. Para ejercer cualquiera de estos derechos escriba a privacidad@movinex.mx indicando el folio de su solicitud.</p>

          <h3>5. Remisiones y transferencias de datos personales</h3>
          
          <h4>5.1 Remisiones a encargados</h4>
          <p>Compartimos sus datos con proveedores que los tratan por cuenta y bajo instrucción de Movinex, sin poder utilizarlos para fines propios. Estos proveedores están obligados contractualmente a mantener las mismas medidas de seguridad y confidencialidad previstas en este Aviso. Son los siguientes:</p>
          
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px", marginBottom: "24px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Proveedor</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Finalidad</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Datos involucrados</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Verificamex</td><td style={{ padding: "12px" }}>Verificación de identidad y validación biométrica</td><td style={{ padding: "12px" }}>Identificación, biométricos</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Conekta y Stripe</td><td style={{ padding: "12px" }}>Procesamiento del pago inicial y asignación, recepción y conciliación de la cuenta CLABE única de cada operación. Stripe, Inc. es una entidad establecida en los Estados Unidos de América.</td><td style={{ padding: "12px" }}>Identificación, contacto, financieros</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Skydropx y la empresa de paquetería contratada</td><td style={{ padding: "12px" }}>Generación de guías, envío, entrega y devoluciones del equipo</td><td style={{ padding: "12px" }}>Identificación, contacto, domicilio</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Trustonic (vía Bantos)</td><td style={{ padding: "12px" }}>Operación del Servicio de Seguridad y Bloqueo</td><td style={{ padding: "12px" }}>Datos del equipo, identificación</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Proveedor de nube</td><td style={{ padding: "12px" }}>Alojamiento y respaldo de bases de datos</td><td style={{ padding: "12px" }}>Todas las categorías</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Meta Platforms</td><td style={{ padding: "12px" }}>Comunicación por WhatsApp y publicidad digital</td><td style={{ padding: "12px" }}>Contacto, navegación</td></tr>
            </tbody>
          </table>

          <h4>5.2 Transferencia internacional</h4>
          <p>Le informamos de manera expresa que nuestras bases de datos se alojan en infraestructura de cómputo en la nube ubicada en el estado de Virginia, Estados Unidos de América. En consecuencia, sus datos personales son remitidos y almacenados fuera del territorio nacional.</p>
          <p>Esta remisión se realiza únicamente a proveedores que actúan por cuenta de Movinex, quienes están obligados contractualmente a aplicar medidas de seguridad administrativas, técnicas y físicas equivalentes a las previstas en la legislación mexicana y en este Aviso. Movinex conserva en todo momento el carácter de Responsable respecto de dichos datos.</p>

          <h4>5.3 Transferencias que no requieren su consentimiento</h4>
          <p>Sus datos personales podrán ser transferidos, sin requerir su consentimiento, en los supuestos previstos por la LFPDPPP, entre ellos:</p>
          <ul>
            <li>A autoridades administrativas, fiscales, judiciales o ministeriales competentes, cuando sea legalmente exigible, incluyendo la presentación de avisos en materia de prevención de operaciones con recursos de procedencia ilícita.</li>
            <li>A nuestros asesores legales, contables y auditores externos, sujetos a deber de confidencialidad.</li>
            <li>A terceros cesionarios, en caso de fusión, escisión, adquisición o cesión de cartera de Movinex.</li>
            <li>Cuando sea necesario para el reconocimiento, ejercicio o defensa de un derecho en un proceso judicial.</li>
          </ul>
          <p>Fuera de los supuestos anteriores, Movinex no vende, alquila ni comercializa sus datos personales.</p>

          <h3>6. Derechos ARCO</h3>
          <p>Usted tiene derecho a Acceder a sus datos personales, a Rectificarlos cuando sean inexactos o incompletos, a Cancelarlos cuando considere que no son necesarios, y a Oponerse a su tratamiento para fines específicos. Asimismo, puede revocar el consentimiento que nos otorgó y limitar el uso o divulgación de sus datos.</p>
          <p>El ejercicio de estos derechos es gratuito.</p>
          
          <h4>Cómo ejercerlos</h4>
          <p>Envíe su solicitud al correo privacidad@movinex.mx con el asunto "Solicitud de Derechos ARCO", incluyendo:</p>
          <ol>
            <li>Su nombre completo y un domicilio o correo electrónico para recibir la respuesta.</li>
            <li>Copia de una identificación oficial vigente que acredite su identidad, o de la documentación que acredite la representación legal, en su caso.</li>
            <li>La descripción clara y precisa de los datos personales respecto de los cuales busca ejercer el derecho, y el derecho que desea ejercer.</li>
            <li>Cualquier elemento o documento que facilite la localización de sus datos.</li>
            <li>Tratándose de rectificación, la modificación solicitada y la documentación que la sustente.</li>
          </ol>

          <h4>Plazos</h4>
          <p>Le comunicaremos la determinación adoptada en un plazo máximo de 20 días hábiles contados desde la recepción de su solicitud, o en el menor plazo que la ley establezca. De resultar procedente, la haremos efectiva dentro de los 15 días hábiles siguientes. Si su solicitud es incompleta, se lo haremos saber dentro de los 5 días hábiles siguientes para que la complemente.</p>

          <h4>Limitaciones</h4>
          <p>En ciertos supuestos previstos por la ley, el ejercicio de estos derechos puede no ser procedente. En particular, mientras exista una obligación de pago vigente a su cargo, no podremos cancelar los datos necesarios para la administración y cobro del financiamiento, ni aquellos que debamos conservar por disposición legal en materia fiscal y de prevención de lavado de dinero.</p>

          <h3>7. Revocación del consentimiento</h3>
          <p>Puede revocar en cualquier momento el consentimiento otorgado para el tratamiento de sus datos, mediante solicitud enviada a privacidad@movinex.mx.</p>
          <p>Tome en cuenta que la revocación del consentimiento respecto de las finalidades necesarias señaladas en el numeral 3.1 puede implicar la imposibilidad de continuar prestándole el servicio y, en su caso, dar lugar a la terminación anticipada del contrato con las consecuencias ahí pactadas. La revocación respecto de las finalidades voluntarias del numeral 3.2 no tiene efecto alguno sobre su financiamiento.</p>

          <h3>8. Uso de cookies y tecnologías de rastreo</h3>
          <p>Nuestro sitio web utiliza cookies, píxeles y tecnologías similares, tanto propias como de terceros, para el funcionamiento del sitio, el análisis de tráfico y la publicidad personalizada. Puede consultar el detalle y configurar sus preferencias en nuestra Política de Cookies, disponible en https://www.movinex.mx/cookies, así como a través del panel de configuración que se muestra al ingresar al sitio.</p>

          <h3>9. Medidas de seguridad</h3>
          <p>Movinex ha implementado medidas de seguridad administrativas, técnicas y físicas razonables para proteger sus datos personales contra daño, pérdida, alteración, destrucción, uso, acceso o tratamiento no autorizado. Entre ellas: cifrado en tránsito y en reposo, control de accesos por perfiles, tokenización de datos de tarjetas por parte de nuestros procesadores de pago, registro de accesos y acuerdos de confidencialidad con nuestro personal y proveedores.</p>
          <p>En caso de que ocurra una vulneración de seguridad que afecte de forma significativa sus derechos patrimoniales o morales, se lo informaremos sin demora para que pueda tomar las medidas correspondientes.</p>

          <h3>10. Plazo de conservación</h3>
          <p>Conservaremos sus datos personales durante la vigencia de la relación contractual y, posteriormente, durante los plazos de conservación exigidos por la legislación fiscal, mercantil y de prevención de lavado de dinero aplicables. Conservaremos igualmente, por los mismos plazos, las constancias de aceptación y de firma electrónica de los documentos que usted acepte, así como las constancias de conservación de mensajes de datos emitidas conforme a la NOM-151-SCFI-2016. Concluidos dichos plazos, sus datos serán bloqueados y posteriormente suprimidos de forma segura. Los datos biométricos se conservan únicamente por el plazo necesario para acreditar la debida verificación de identidad y la validez del consentimiento otorgado.</p>

          <h3>11. Cambios al Aviso de Privacidad</h3>
          <p>Este Aviso puede sufrir modificaciones derivadas de cambios legislativos, de nuestras prácticas de privacidad o de nuestro modelo de negocio. Cualquier modificación será publicada en https://www.movinex.mx/privacidad, indicando la fecha de la última actualización. Le recomendamos consultar dicha página periódicamente. Cuando los cambios sean sustanciales, se lo notificaremos adicionalmente al correo electrónico o número de WhatsApp que tengamos registrado.</p>

          <h3>12. Autoridad en materia de protección de datos</h3>
          <p>Si considera que su derecho a la protección de datos personales ha sido vulnerado, o presume la existencia de alguna violación a las disposiciones de la LFPDPPP, puede acudir ante la Secretaría Anticorrupción y Buen Gobierno, autoridad competente en la materia respecto del sector privado.</p>

          <h3>13. Consentimiento expreso</h3>
          
          <h4>13.1 Datos personales sensibles</h4>
          <p>Consiento expresamente que NVX TECHNOLOGIES, S. DE R.L. DE C.V. recabe y trate mis datos personales biométricos —imagen facial, plantilla biométrica y prueba de vida— para las finalidades de verificación de identidad y prevención de fraude descritas en este Aviso de Privacidad.</p>
          <p>☐  Acepto</p>
          
          <h4>13.2 Datos financieros y patrimoniales</h4>
          <p>Consiento expresamente el tratamiento de mis datos financieros y patrimoniales para la evaluación de mi solicitud, la formalización del contrato, el cobro del pago inicial y la recepción, identificación y conciliación de los pagos que realice a la cuenta CLABE única asignada a mi operación, en los términos de este Aviso de Privacidad.</p>
          <p>☐  Acepto</p>
          
          <h4>13.3 Transferencia internacional</h4>
          <p>Me doy por enterado y consiento que mis datos personales sean almacenados en infraestructura de cómputo ubicada en el estado de Virginia, Estados Unidos de América, en los términos del numeral 5.2 de este Aviso de Privacidad.</p>
          <p>☐  Acepto</p>
          
          <h4>13.4 Finalidades voluntarias</h4>
          <p>Acepto recibir comunicaciones publicitarias y promocionales de Movinex por correo electrónico, WhatsApp, mensajes de texto, llamadas y redes sociales, y que mis datos se utilicen para encuestas y segmentación publicitaria.</p>
          <p>☐  Acepto</p>
          <p>☐  No acepto</p>
          <p><small>Esta casilla es opcional. Negarse no afecta la evaluación de su solicitud ni las condiciones de su financiamiento.</small></p>
        </div>
      </section>
    );
  }

  if (page === "terminos") {
    return (
      <section className={styles.aboutSection}>
        <div className={styles.aboutContent}>
          <span className={styles.eyebrow}>LEGAL</span>
          <h1>Términos y Condiciones</h1>
          <p>NVX TECHNOLOGIES, S. DE R.L. DE C.V. — MOVINEX  ·  movinex.mx  ·  Vigente a partir del 6 de agosto de 2026</p>
          
          <p>Este documento contiene los Términos y Condiciones aplicables a los servicios de Movinex y se integra por cuatro secciones. La Sección C se emite conforme al artículo 66 de la Ley Federal de Protección al Consumidor.</p>

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px", marginBottom: "24px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Sección</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Contenido</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>A quién aplica</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>A</td><td style={{ padding: "12px" }}>Disposiciones generales</td><td style={{ padding: "12px" }}>A toda persona que use el sitio o contrate con Movinex</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>B</td><td style={{ padding: "12px" }}>Uso del sitio web</td><td style={{ padding: "12px" }}>A quien navegue o utilice movinex.mx</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>C</td><td style={{ padding: "12px" }}>Venta a crédito</td><td style={{ padding: "12px" }}>A quien contrate el financiamiento de un equipo</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>D</td><td style={{ padding: "12px" }}>Disposiciones comunes</td><td style={{ padding: "12px" }}>A todos los supuestos anteriores</td></tr>
            </tbody>
          </table>

          <h3>SECCIÓN A. Disposiciones generales</h3>
          
          <h4>A.1 Identidad del prestador</h4>
          <p>NVX TECHNOLOGIES, S. DE R.L. DE C.V., que opera comercialmente bajo la marca MOVINEX (“Movinex”), es la sociedad responsable del sitio web y de las operaciones descritas en este documento.</p>

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px", marginBottom: "24px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Concepto</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Dato</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Denominación social</td><td style={{ padding: "12px" }}>NVX TECHNOLOGIES, S. DE R.L. DE C.V.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Marca comercial</td><td style={{ padding: "12px" }}>MOVINEX</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>RFC</td><td style={{ padding: "12px" }}>NTE2603034X5</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Domicilio</td><td style={{ padding: "12px" }}>Calle Bosque de Arrayán número exterior 1, interior LT 1 417, Colonia Bosque Esmeralda, Ciudad López Mateos, Atizapán de Zaragoza, Estado de México, C.P. 52930</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Sitio web</td><td style={{ padding: "12px" }}><a href="https://movinex.mx" target="_blank" rel="noreferrer">https://movinex.mx</a></td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Atención a clientes</td><td style={{ padding: "12px" }}>info@movinex.mx</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Privacidad y derechos ARCO</td><td style={{ padding: "12px" }}>privacidad@movinex.mx</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Teléfono y WhatsApp</td><td style={{ padding: "12px" }}>55 5502 8744</td></tr>
            </tbody>
          </table>

          <h4>A.2 Aceptación</h4>
          <p>Al acceder al sitio, navegar en él, utilizar cualquiera de sus funcionalidades o contratar los productos de Movinex, usted manifiesta su conformidad con estos Términos. Si no está de acuerdo, debe abstenerse de utilizar el sitio y de contratar.</p>
          <p>La Sección C requiere, además, su aceptación expresa mediante casilla específica antes de formalizar cualquier operación de financiamiento.</p>

          <h4>A.3 Capacidad legal</h4>
          <p>El uso del sitio y la contratación de nuestros productos está reservada a personas físicas mayores de 18 años con plena capacidad de ejercicio conforme a la legislación mexicana. Al utilizar el sitio, usted declara cumplir con este requisito. Movinex podrá cancelar cualquier solicitud u operación cuando detecte que el usuario no cumple con esta condición.</p>

          <h4>A.4 Naturaleza de la operación</h4>
          <p>Movinex no es una institución financiera. Es una sociedad mercantil que vende equipos de telefonía móvil y financia directamente el precio de dichos equipos a sus propios clientes.</p>
          <p>La operación que usted celebra es una compraventa a plazos con reserva de dominio, regulada por la Ley Federal de Protección al Consumidor y por el Código de Comercio. No se trata de un crédito otorgado por una entidad del sistema financiero, por lo que Movinex no se encuentra sujeta a la supervisión de la Comisión Nacional Bancaria y de Valores ni a los registros de la Comisión Nacional para la Protección y Defensa de los Usuarios de Servicios Financieros.</p>
          <p>La autoridad competente para conocer de controversias derivadas de esta operación es la Procuraduría Federal del Consumidor (PROFECO).</p>

          <h3>SECCIÓN B. Uso del sitio web</h3>
          
          <h4>B.1 Uso permitido</h4>
          <p>Usted se obliga a utilizar el sitio conforme a la ley, a la buena fe y a estos Términos. De manera enunciativa, queda prohibido:</p>
          <ul>
            <li>Proporcionar información falsa, inexacta, incompleta o que corresponda a un tercero sin su autorización.</li>
            <li>Suplantar la identidad de otra persona o utilizar identificaciones oficiales o medios de pago ajenos.</li>
            <li>Realizar ingeniería inversa, descompilar, extraer código fuente o intentar acceder a áreas restringidas del sitio o de nuestros sistemas.</li>
            <li>Emplear robots, scrapers, crawlers u otros medios automatizados para extraer información del sitio sin autorización escrita.</li>
            <li>Introducir virus, código malicioso o cualquier elemento que pueda dañar, sobrecargar o inutilizar el sitio.</li>
            <li>Utilizar el sitio para fines ilícitos, fraudulentos o contrarios a estos Términos.</li>
            <li>Reproducir, distribuir o explotar comercialmente los contenidos del sitio sin autorización.</li>
          </ul>
          <p>El incumplimiento de estas obligaciones faculta a Movinex a suspender o cancelar su acceso, sin perjuicio de las acciones legales que correspondan.</p>

          <h4>B.2 Cuenta de usuario y credenciales</h4>
          <p>Cuando el sitio le permita crear una cuenta, usted es responsable de la confidencialidad de sus credenciales y de toda actividad realizada con ellas. Debe notificar de inmediato a info@movinex.mx cualquier uso no autorizado. Movinex no será responsable por pérdidas derivadas del incumplimiento de esta obligación.</p>

          <h4>B.3 Solicitudes de financiamiento</h4>
          <p>El llenado de un formulario de solicitud en el sitio constituye únicamente una solicitud y no genera obligación alguna a cargo de Movinex de otorgar el financiamiento.</p>
          <p>Las solicitudes se evalúan mediante procesos automatizados con métricas propias de Movinex. Movinex no consulta sociedades de información crediticia. Movinex se reserva el derecho de aprobar o rechazar cualquier solicitud a su entera discreción, sin obligación de expresar la causa. Un rechazo no genera registro negativo alguno ante terceros ni afecta futuras solicitudes.</p>
          <p>Conforme a la normativa de protección de datos, usted puede solicitar la intervención de una persona de Movinex para revisar una decisión automatizada, conocer la lógica general aplicada e impugnarla, escribiendo a privacidad@movinex.mx.</p>

          <h4>B.4 Información de precios y disponibilidad</h4>
          <p>Los precios, plazos, tasas, modelos y existencias mostrados en el sitio son informativos y están sujetos a disponibilidad y a confirmación al momento de la contratación. Todos los precios se expresan en pesos mexicanos e incluyen el Impuesto al Valor Agregado cuando así se indique.</p>
          <p>Los cotizadores y simuladores disponibles en el sitio producen estimaciones con fines informativos. Las cifras definitivas y vinculantes son únicamente las que aparecen en la Carátula de Condiciones y en la Tabla de Amortización que se le muestran y que usted acepta antes de formalizar la operación.</p>
          <p>Movinex corregirá los errores tipográficos o de sistema evidentes en precios o condiciones, notificándolo al usuario y permitiendo la cancelación sin penalización antes de la formalización.</p>

          <h4>B.5 Contratación electrónica y evidencia</h4>
          <p>Usted reconoce y acepta que la manifestación de su voluntad por medios electrónicos —incluyendo la marcación de casillas de aceptación, la captura de códigos de un solo uso enviados a su teléfono o correo, la verificación biométrica y la firma electrónica— produce los mismos efectos jurídicos que la firma autógrafa, en términos del Código de Comercio.</p>
          <p>Movinex conserva registros electrónicos de dichas manifestaciones, incluyendo fecha y hora, dirección IP, dispositivo utilizado, número al que se envió el código de un solo uso, cada casilla aceptada con su hora individual, y el identificador de versión y la huella digital (hash) del documento exacto que se le mostró. Estos registros constituyen prueba de la celebración del acto. Movinex obtiene además, respecto de cada operación, una constancia de conservación de mensajes de datos emitida por un Prestador de Servicios de Certificación acreditado, conforme a la NOM-151-SCFI-2016. Usted podrá solicitar copia de los documentos que haya aceptado y de dichas constancias escribiendo a info@movinex.mx.</p>

          <h4>B.6 Propiedad intelectual</h4>
          <p>Todos los contenidos del sitio —incluyendo la marca MOVINEX, logotipos, diseños, textos, imágenes, bases de datos, código fuente e interfaces— son propiedad de Movinex o de sus licenciantes y están protegidos por la legislación aplicable en materia de propiedad industrial y derechos de autor.</p>
          <p>Las marcas de los fabricantes de los equipos que comercializamos pertenecen a sus respectivos titulares y se utilizan únicamente con fines identificativos del producto. Movinex no es fabricante ni representante de dichas marcas.</p>
          <p>El acceso al sitio no otorga licencia ni derecho alguno sobre estos contenidos, salvo el uso estrictamente personal e informativo.</p>

          <h4>B.7 Enlaces y servicios de terceros</h4>
          <p>El sitio puede integrar o enlazar servicios de terceros, tales como procesadores de pago, verificadores de identidad, plataformas de mensajería y transportistas. Movinex no controla dichos servicios y no asume responsabilidad por su contenido, disponibilidad o políticas. El uso de esos servicios se rige por sus propios términos.</p>

          <h4>B.8 Disponibilidad y limitación de responsabilidad</h4>
          <p>Movinex procura mantener el sitio disponible de forma continua, pero no garantiza su funcionamiento ininterrumpido ni libre de errores. El sitio puede suspenderse por mantenimiento, actualizaciones, fallas técnicas o causas de fuerza mayor.</p>
          <p>En la medida permitida por la ley, Movinex no será responsable por daños derivados de la imposibilidad de acceder al sitio, de errores de terceros proveedores, o del uso indebido del sitio por parte del usuario.</p>
          <p>Ninguna disposición de estos Términos limita o excluye los derechos que la Ley Federal de Protección al Consumidor reconoce a los consumidores, los cuales son irrenunciables.</p>

          <h3>SECCIÓN C. Venta a crédito</h3>
          <p>Sección emitida conforme al artículo 66 de la Ley Federal de Protección al Consumidor.</p>
          
          <h4>C.1 Requisitos</h4>
          <ul>
            <li>Ser persona física mayor de 18 años con plena capacidad de ejercicio.</li>
            <li>Contar con identificación oficial vigente y superar el proceso de verificación de identidad, que incluye validación biométrica.</li>
            <li>Proporcionar un domicilio de entrega dentro del territorio nacional.</li>
            <li>Registrar una tarjeta de débito o crédito válida a su nombre para el pago inicial, y contar con una cuenta bancaria a su nombre desde la cual realizar los pagos semanales.</li>
            <li>Aceptar el Aviso de Privacidad, los presentes Términos y la Carátula de Condiciones de su operación.</li>
          </ul>

          <h4>C.2 Estructura del precio y del financiamiento</h4>
          <p>Movinex opera un catálogo de equipos de distintas marcas, modelos y precios. Por ello, las condiciones se expresan a continuación en porcentajes del precio de contado y en importes fijos en pesos, según corresponda, aplicables de manera uniforme a cualquier equipo del catálogo. Los importes exactos en pesos correspondientes al equipo que usted elija se le muestran, antes de contratar, en la Carátula de Condiciones y en la Tabla de Amortización.</p>

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px", marginBottom: "24px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Concepto</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Condición aplicable</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Precio de contado</td><td style={{ padding: "12px" }}>El precio publicado del equipo seleccionado, en pesos mexicanos, con IVA incluido.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Pago inicial (enganche)</td><td style={{ padding: "12px" }}>15.00% del precio de contado.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Monto a financiar</td><td style={{ padding: "12px" }}>85.00% del precio de contado.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Tasa de interés anual fija</td><td style={{ padding: "12px" }}>228.00% anual sobre saldos insolutos. Tasa fija. No capitalizable.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Tasa de interés semanal</td><td style={{ padding: "12px" }}>4.3846% sobre saldos insolutos (228.00% ÷ 52).</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>IVA sobre intereses</td><td style={{ padding: "12px" }}>16.00% sobre el interés ordinario devengado en cada periodo.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Servicio de Seguridad y Bloqueo del Equipo</td><td style={{ padding: "12px" }}>$17.00 (diecisiete pesos 00/100 M.N.) semanales, más IVA del 16.00%; es decir, $19.72 semanales con IVA incluido. Importe fijo, con independencia del precio del equipo y del plazo. Servicio obligatorio.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Interés moratorio</td><td style={{ padding: "12px" }}>No se cobra interés moratorio.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Comisión por apertura</td><td style={{ padding: "12px" }}>No se cobra.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Comisión por pago anticipado</td><td style={{ padding: "12px" }}>No se cobra.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Costo de envío</td><td style={{ padding: "12px" }}>Por cuenta del consumidor. Se calcula según el domicilio de entrega y se le muestra desglosado antes de que usted confirme la operación. Movinex puede ofrecer promociones de envío sin costo, sujetas a su vigencia y condiciones.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Plazos disponibles</td><td style={{ padding: "12px" }}>26 o 52 pagos semanales, a elección del consumidor.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Sistema de amortización</td><td style={{ padding: "12px" }}>Francés. Pago periódico de importe constante. El pago semanal se redondea al peso cerrado; el último pago se ajusta para dejar el saldo en cero y nunca será mayor que el pago semanal ordinario.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Periodicidad y forma de pago</td><td style={{ padding: "12px" }}>Semanal. El pago inicial se cobra a la tarjeta que usted registre. Los pagos semanales los realiza usted mediante transferencia electrónica a una cuenta CLABE única asignada a su operación. Movinex no domicilia ni carga automáticamente los pagos semanales.</td></tr>
            </tbody>
          </table>
          <p>No existen cargos, comisiones ni conceptos distintos a los señalados en esta tabla. Cualquier concepto no listado no será exigible.</p>

          <h4>C.3 Costo total del financiamiento</h4>
          <p>Los siguientes indicadores resultan de aplicar las condiciones del numeral C.2 y son válidos para cualquier equipo del catálogo. Los porcentajes se calculan sobre el monto financiado y no dependen del precio del equipo; el Servicio de Seguridad y Bloqueo es un importe fijo en pesos, por lo que su peso relativo sí varía según el precio del equipo:</p>

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px", marginBottom: "24px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Indicador</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>26 semanas</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>52 semanas</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Pago base semanal (capital + interés + IVA), como % del monto financiado</td><td style={{ padding: "12px" }}>7.0184%</td><td style={{ padding: "12px" }}>5.5033%</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Intereses ordinarios totales, como % del monto financiado</td><td style={{ padding: "12px" }}>71.10%</td><td style={{ padding: "12px" }}>160.49%</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>IVA sobre intereses, como % del monto financiado</td><td style={{ padding: "12px" }}>11.38%</td><td style={{ padding: "12px" }}>25.68%</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Servicio de Seguridad y Bloqueo semanal, importe fijo con IVA incluido</td><td style={{ padding: "12px" }}>$19.72</td><td style={{ padding: "12px" }}>$19.72</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Servicio de Seguridad y Bloqueo, total en el plazo con IVA incluido</td><td style={{ padding: "12px" }}>$512.72</td><td style={{ padding: "12px" }}>$1,025.44</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Pago semanal total</td><td style={{ padding: "12px" }}>7.0184% del monto financiado más $19.72, redondeado al peso cerrado.</td><td style={{ padding: "12px" }}>5.5033% del monto financiado más $19.72, redondeado al peso cerrado.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Monto total a pagar en el plazo</td><td style={{ padding: "12px" }}>Suma de 26 pagos semanales. El último pago se ajusta y nunca es mayor que el pago ordinario.</td><td style={{ padding: "12px" }}>Suma de 52 pagos semanales. El último pago se ajusta y nunca es mayor que el pago ordinario.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Costo total de la operación</td><td style={{ padding: "12px" }}>Pago inicial más la suma de los pagos semanales. Se le muestra en pesos en su Carátula de Condiciones.</td><td style={{ padding: "12px" }}>Pago inicial más la suma de los pagos semanales. Se le muestra en pesos en su Carátula de Condiciones.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Costo Anual Total (CAT), informativo</td><td style={{ padding: "12px" }}>Se calcula para su equipo y su plazo, e incorpora la totalidad de los cargos obligatorios. Se le muestra en su Carátula de Condiciones antes de contratar.</td><td style={{ padding: "12px" }}>Se calcula para su equipo y su plazo, e incorpora la totalidad de los cargos obligatorios. Se le muestra en su Carátula de Condiciones antes de contratar.</td></tr>
            </tbody>
          </table>
          <p>Nota sobre el CAT. Movinex no es una entidad financiera y por tanto no está obligada a publicar el Costo Anual Total. Se incluye de forma voluntaria, calculado conforme al criterio de tasa anual efectiva e incorporando la totalidad de los cargos obligatorios, con el único propósito de que usted pueda comparar esta oferta con otras del mercado. Debido a que el Servicio de Seguridad y Bloqueo es un importe fijo en pesos, el CAT es mayor en los equipos de menor precio y menor en los de mayor precio; por ello se calcula y se le informa para cada operación en particular, en lugar de publicarse una cifra única para todo el catálogo.</p>

          <h4>Ejemplo representativo</h4>
          <p>Equipo con precio de contado de $2,499.00 M.N., a 52 pagos semanales:</p>

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px", marginBottom: "24px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Concepto</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Importe</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px" }}>Precio de contado</td><td style={{ padding: "12px" }}>$2,499.00</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px" }}>Pago inicial (15%)</td><td style={{ padding: "12px" }}>$374.85</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px" }}>Monto a financiar (85%)</td><td style={{ padding: "12px" }}>$2,124.15</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px" }}>Pago semanal (capital + interés + IVA)</td><td style={{ padding: "12px" }}>$117.28</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px" }}>Servicio de Seguridad y Bloqueo semanal + IVA</td><td style={{ padding: "12px" }}>$19.72</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Pago semanal total</td><td style={{ padding: "12px", fontWeight: "700", color: "#2B6BE4" }}>$137.00</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px" }}>Intereses ordinarios totales</td><td style={{ padding: "12px" }}>$3,347.20</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px" }}>IVA sobre intereses</td><td style={{ padding: "12px" }}>$535.55</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px" }}>Servicio de Seguridad y Bloqueo total (52 semanas)</td><td style={{ padding: "12px" }}>$884.00</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px" }}>IVA sobre el Servicio</td><td style={{ padding: "12px" }}>$141.44</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px" }}>Total a pagar en el plazo</td><td style={{ padding: "12px" }}>$7,032.34</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Costo total (pago inicial + plazo)</td><td style={{ padding: "12px", fontWeight: "700" }}>$7,407.19</td></tr>
            </tbody>
          </table>
          <p><small>Ejemplo con fines ilustrativos, calculado con las condiciones del numeral C.2. En este ejemplo el último pago es de $45.34, por efecto del redondeo del pago semanal al peso cerrado. No incluye el costo de envío, que se calcula según el domicilio de entrega. Las cifras aplicables a su operación son las de su Carátula de Condiciones y Tabla de Amortización.</small></p>

          <h4>C.4 Carátula de Condiciones y Tabla de Amortización</h4>
          <p>Antes de que usted formalice la operación, Movinex le muestra y pone a su disposición para descarga:</p>
          <ul>
            <li>La Carátula de Condiciones, que contiene el precio de contado del equipo, el pago inicial, el monto financiado, la tasa de interés, el importe del Servicio de Seguridad y Bloqueo, el número y periodicidad de los pagos, el importe de cada pago y el monto total a pagar.</li>
            <li>La Tabla de Amortización completa, con el desglose por periodo de saldo inicial, interés, IVA sobre interés, capital, Servicio de Seguridad y Bloqueo, IVA sobre el Servicio, pago total y saldo final.</li>
          </ul>
          <p>Al momento de despachar su equipo, Movinex emite y le remite el Anexo de Identificación del Equipo, que contiene la marca, el modelo, la capacidad, el color, el número de serie y el IMEI del dispositivo que le fue asignado. Dicho Anexo forma parte integrante de su operación y es el que identifica el bien sujeto a la reserva de dominio prevista en el numeral C.6. Usted recibirá copia de la Carátula de Condiciones, de la Tabla de Amortización y del Anexo de Identificación del Equipo, junto con estos Términos, en el correo electrónico registrado. En caso de discrepancia entre estos Términos y su Carátula de Condiciones, prevalecerá lo más favorable al consumidor.</p>

          <h4>C.5 Servicio de Seguridad y Bloqueo del Equipo</h4>
          <p>Este servicio es obligatorio y forma parte del costo total de la operación. Su importe se encuentra incorporado en su pago semanal y desglosado en la Carátula de Condiciones.</p>
          
          <h5>C.5.1 En qué consiste</h5>
          <p>Movinex instala en el equipo un software de gestión remota que permite bloquear y desbloquear su funcionamiento. Este software es operado por un proveedor tecnológico especializado contratado por Movinex.</p>
          
          <h5>C.5.2 Beneficio a su favor</h5>
          <p>Durante la vigencia del financiamiento, usted puede solicitar a Movinex el bloqueo remoto de su equipo en caso de robo o extravío, sin costo adicional, comunicándose a los canales de atención. El bloqueo impide el uso del equipo por parte de terceros.</p>
          
          <h5>C.5.3 Bloqueo por falta de pago</h5>
          <p>Movinex le enviará un recordatorio antes de cada fecha de vencimiento y un aviso previo al bloqueo, al correo electrónico y al WhatsApp registrados. En caso de que un pago no se acredite en la fecha pactada, el equipo será bloqueado a partir del día hábil siguiente al vencimiento.</p>
          <p>Si usted realizó la transferencia dentro de la fecha pactada y esta se acredita con posterioridad, el bloqueo se levanta en cuanto el pago se identifique, sin cargo ni trámite alguno a su cargo. Durante el bloqueo el equipo conserva habilitadas las llamadas a números de emergencia, incluido el 911, así como la comunicación con los canales de atención de Movinex. Ninguna circunstancia da lugar a la desactivación de las llamadas de emergencia.</p>
          <p>El bloqueo no extingue ni suspende su obligación de pago, y no constituye una penalización económica adicional.</p>
          
          <h5>C.5.4 Desbloqueo</h5>
          <p>Una vez acreditado el pago pendiente, el equipo se desbloquea de forma automática, ordinariamente dentro de los 30 minutos siguientes a la confirmación del pago por parte del procesador. Si el desbloqueo no ocurre, comuníquese a info@movinex.mx o al 55 5502 8744 y será atendido de forma prioritaria.</p>
          
          <h5>C.5.5 Liberación definitiva</h5>
          <p>Al liquidar la totalidad del financiamiento, el software se desinstala de forma automática y permanente, y Movinex le remite constancia de liquidación y liberación del equipo al correo registrado. A partir de ese momento el equipo queda libre de todo gravamen y limitación.</p>
          
          <h5>C.5.6 Alcance</h5>
          <p>El software no accede al contenido de sus comunicaciones, archivos, fotografías ni aplicaciones. Los datos que trata se limitan a los identificadores técnicos del equipo y a su estado de bloqueo, conforme al Aviso de Privacidad.</p>
          <p>Queda prohibido remover, deshabilitar, eludir o manipular el software. Hacerlo constituye incumplimiento del contrato y da lugar al vencimiento anticipado del saldo insoluto.</p>

          <h4>C.6 Reserva de dominio</h4>
          <p>Movinex conserva la propiedad del equipo hasta la liquidación total del precio. Usted adquiere la posesión y el uso del equipo desde su entrega, y la propiedad se transmite de pleno derecho al momento del pago final.</p>
          <p>El equipo sujeto a reserva de dominio es el identificado por su número de serie e IMEI en el Anexo de Identificación del Equipo a que se refiere el numeral C.4. Movinex podrá inscribir la reserva de dominio en el Registro Único de Garantías Mobiliarias (RUG) de la Secretaría de Economía, y se obliga a cancelar dicha inscripción una vez liquidada la operación. Mientras subsista la reserva de dominio, usted se obliga a no vender, empeñar, gravar ni transmitir el equipo a terceros.</p>

          <h4>C.7 Pagos</h4>
          <ul>
            <li>Al formalizar su operación, Movinex le asigna una cuenta CLABE única, exclusiva de su financiamiento y vigente durante todo el plazo. Los pagos son semanales y usted los realiza mediante transferencia electrónica a dicha CLABE, en las fechas señaladas en su Tabla de Amortización.</li>
            <li>Los pagos recibidos en su CLABE se identifican y se aplican automáticamente a su saldo. Es su responsabilidad realizar cada pago a más tardar en la fecha pactada. Le recomendamos transferir desde una cuenta a su nombre y conservar el comprobante de la operación.</li>
            <li>Únicamente el pago inicial se cobra a la tarjeta de débito o crédito que usted registre al contratar. Movinex no realiza cargos automáticos ni domiciliaciones sobre sus pagos semanales.</li>
            <li>Usted puede realizar pagos anticipados, parciales o totales, en cualquier momento y sin penalización alguna, a la misma CLABE. Los pagos anticipados se aplican a capital y reducen los intereses futuros. Puede consultar su saldo y solicitar la cifra de liquidación en cualquier momento a través de nuestros canales de atención.</li>
            <li>Movinex emite de forma automática el comprobante fiscal digital por internet (CFDI) que corresponde a la operación y a cada pago recibido, y se lo remite al correo electrónico registrado. Si desea que el comprobante se emita con sus datos fiscales, proporciónelos antes de contratar; en caso contrario se emitirá conforme a las disposiciones fiscales aplicables.</li>
          </ul>

          <h4>C.8 Incumplimiento y cobranza</h4>
          <p>Usted reconoce que el saldo insoluto que arroje su Tabla de Amortización, adicionado de los conceptos devengados y no pagados, constituye un adeudo líquido y exigible a su cargo. Ante la falta de pago, Movinex podrá: (i) bloquear el equipo conforme al numeral C.5.3; (ii) realizar gestiones de cobranza; y (iii) transcurridos 90 días naturales de mora continua, declarar el vencimiento anticipado del saldo insoluto y ejercer las acciones legales que correspondan, incluida la recuperación del equipo en términos de la reserva de dominio.</p>
          <p>La cobranza se realiza por Movinex, en horarios y con prácticas respetuosas, sin recurrir a amenazas, intimidación, lenguaje ofensivo, ni a la divulgación de su situación a terceros ajenos a la operación. Movinex no reporta su comportamiento de pago a sociedades de información crediticia.</p>
          <p>Si usted enfrenta una dificultad temporal de pago, comuníquese antes del vencimiento a info@movinex.mx o al 55 5502 8744; evaluaremos alternativas de reestructura.</p>

          <h4>C.9 Entrega, garantía y devoluciones</h4>
          <p>Las condiciones de envío, entrega, garantía, reposición y devoluciones se detallan en la Política de Envíos, Garantías y Devoluciones, disponible en https://www.movinex.mx/envios, la cual forma parte integrante de estos Términos. Sus disposiciones principales son:</p>

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px", marginBottom: "24px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Concepto</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Condición</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Cobertura</td><td style={{ padding: "12px" }}>Nacional. El costo de envío corre por cuenta del consumidor y se muestra antes de confirmar la operación; pueden aplicar promociones de envío sin costo.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Plazo máximo de entrega</td><td style={{ padding: "12px" }}>De 3 a 7 días hábiles en zonas metropolitanas y hasta 12 días hábiles en zonas extendidas, desde la confirmación del pago inicial.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Incumplimiento del plazo por Movinex</td><td style={{ padding: "12px" }}>Transcurridos 5 días hábiles adicionales al plazo sin entrega, el consumidor puede cancelar con devolución íntegra del pago inicial y del costo de envío.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Garantía</td><td style={{ padding: "12px" }}>12 meses desde la entrega, gestionada por Movinex sin costo.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Reposición sin costo</td><td style={{ padding: "12px" }}>Equipo dañado, incompleto, incorrecto o no entregado.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Devolución por arrepentimiento</td><td style={{ padding: "12px" }}>Usted puede revocar su consentimiento dentro de los 5 días hábiles siguientes a la entrega, conforme al artículo 56 de la Ley Federal de Protección al Consumidor. Concluido ese plazo no aplica devolución por arrepentimiento.</td></tr>
            </tbody>
          </table>

          <h4>C.10 Robo, extravío o destrucción del equipo</h4>
          <p>El equipo viaja por cuenta y riesgo de Movinex hasta su entrega. A partir de la entrega, el riesgo de pérdida, robo o destrucción corre por cuenta del consumidor.</p>
          <p>El robo, extravío o destrucción del equipo no extingue la obligación de pago del saldo insoluto. El Servicio de Seguridad y Bloqueo no constituye un seguro y no cubre la reposición del equipo.</p>
          <p>En caso de robo o extravío, repórtelo de inmediato a Movinex para que procedamos al bloqueo del equipo y evaluemos, caso por caso, alternativas de reestructura del saldo.</p>

          <h4>C.11 Cesión</h4>
          <p>Movinex podrá ceder o transmitir sus derechos de crédito a terceros, sin que ello modifique las condiciones pactadas ni imponga carga alguna al consumidor. Usted no podrá ceder sus obligaciones sin autorización escrita de Movinex.</p>

          <h4>C.12 Declaración del consumidor</h4>
          <p>Manifiesto que se me mostró y puse a mi disposición, antes de contratar, el precio de contado del equipo, el monto del pago inicial, el monto financiado, la tasa de interés, el importe y carácter obligatorio del Servicio de Seguridad y Bloqueo del Equipo, el número y periodicidad de los pagos, el importe de cada pago y el monto total a pagar; que se me explicó el funcionamiento del bloqueo del equipo por falta de pago y la conservación de las llamadas de emergencia; que se me asignó una cuenta CLABE única para realizar mis pagos semanales y que estos no se cargan automáticamente a ninguna tarjeta; y que acepto la Sección C de los presentes Términos y Condiciones, la cual firmo electrónicamente mediante la captura del código de un solo uso que Movinex envió a mi número registrado, con los efectos previstos en el numeral B.5.</p>
          <p>☐  Acepto</p>

          <h3>SECCIÓN D. Disposiciones comunes</h3>
          
          <h4>D.1 Protección de datos personales</h4>
          <p>El tratamiento de sus datos personales se rige por el Aviso de Privacidad de Movinex, disponible en https://www.movinex.mx/privacidad, el cual forma parte integrante de estos Términos.</p>
          
          <h4>D.2 Cookies</h4>
          <p>El sitio utiliza cookies y tecnologías similares conforme a la Política de Cookies disponible en https://www.movinex.mx/cookies. Usted puede configurar sus preferencias desde el panel que se muestra al ingresar al sitio.</p>
          
          <h4>D.3 Comunicaciones</h4>
          <p>Usted acepta que Movinex se comunique con usted por correo electrónico, WhatsApp, mensajes de texto y llamadas telefónicas para asuntos relacionados con su solicitud, su contrato, sus pagos y el estado de su equipo. Estas comunicaciones son operativas y necesarias, y no constituyen publicidad.</p>
          <p>Las comunicaciones publicitarias requieren su consentimiento previo y pueden cancelarse en cualquier momento conforme al Aviso de Privacidad.</p>
          
          <h4>D.4 Modificaciones</h4>
          <p>Movinex puede modificar estos Términos en cualquier momento. La versión vigente será siempre la publicada en https://www.movinex.mx/terminos, con indicación de su fecha de actualización. El uso del sitio con posterioridad a una modificación implica su aceptación.</p>
          <p>Las modificaciones no afectan las operaciones de financiamiento ya celebradas, las cuales se rigen íntegramente por las condiciones vigentes al momento de su contratación y por su Carátula de Condiciones.</p>
          
          <h4>D.5 Nulidad parcial</h4>
          <p>Si alguna disposición de estos Términos fuera declarada nula o inaplicable por autoridad competente, dicha disposición se tendrá por no puesta y las restantes conservarán plena validez.</p>
          
          <h4>D.6 Legislación aplicable, quejas y competencia</h4>
          <p>Estos Términos se rigen por la Ley Federal de Protección al Consumidor, el Código de Comercio y demás legislación mexicana aplicable.</p>
          <p>Cualquier queja o controversia podrá someterse ante la Procuraduría Federal del Consumidor (PROFECO), cuya competencia conciliatoria es irrenunciable y no queda excluida por estos Términos.</p>
          <p>Para todo lo no sujeto a la competencia de PROFECO, las partes se someten a la jurisdicción de los tribunales competentes de Atizapán de Zaragoza, Estado de México, o del domicilio del consumidor, a elección de este último, renunciando a cualquier otro fuero que pudiera corresponderles.</p>

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px", marginBottom: "24px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Canal</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Dato</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Movinex — Atención y quejas</td><td style={{ padding: "12px" }}>info@movinex.mx · 55 5502 8744 (también WhatsApp)</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>PROFECO — Teléfono del Consumidor</td><td style={{ padding: "12px" }}>55 5568 8722 · 800 468 8722</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>PROFECO — Sitio</td><td style={{ padding: "12px" }}><a href="https://www.gob.mx/profeco" target="_blank" rel="noreferrer">https://www.gob.mx/profeco</a></td></tr>
            </tbody>
          </table>

          <h4>D.7 Documentos relacionados</h4>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px", marginBottom: "24px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Documento</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Dónde consultarlo</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Aviso de Privacidad Integral</td><td style={{ padding: "12px" }}><a href="https://www.movinex.mx/privacidad" target="_blank" rel="noreferrer">https://www.movinex.mx/privacidad</a></td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Política de Cookies</td><td style={{ padding: "12px" }}><a href="https://www.movinex.mx/cookies" target="_blank" rel="noreferrer">https://www.movinex.mx/cookies</a></td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Política de Envíos, Garantías y Devoluciones</td><td style={{ padding: "12px" }}><a href="https://www.movinex.mx/envios" target="_blank" rel="noreferrer">https://www.movinex.mx/envios</a></td></tr>
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  if (page === "cookies") {
    return (
      <section className={styles.aboutSection}>
        <div className={styles.aboutContent}>
          <span className={styles.eyebrow}>LEGAL</span>
          <h1>Política de Cookies</h1>
          <p>movinex.mx  ·  NVX TECHNOLOGIES, S. DE R.L. DE C.V. — MOVINEX  ·  Vigente a partir del 6 de agosto de 2026</p>
          
          <h3>1. Quiénes somos</h3>
          <p>NVX TECHNOLOGIES, S. DE R.L. DE C.V. (“Movinex”), con RFC NTE2603034X5 y domicilio en Calle Bosque de Arrayán número exterior 1, interior LT 1 417, Colonia Bosque Esmeralda, Ciudad López Mateos, Atizapán de Zaragoza, Estado de México, C.P. 52930, es responsable del sitio https://movinex.mx y del tratamiento de los datos recabados mediante cookies.</p>

          <h3>2. Qué son las cookies</h3>
          <p>Las cookies son pequeños archivos que un sitio web almacena en su navegador o dispositivo. Permiten que el sitio funcione correctamente, recuerde sus preferencias y obtenga información sobre cómo se utiliza. Esta política aplica también a tecnologías similares como píxeles de seguimiento, etiquetas, SDK y almacenamiento local del navegador.</p>

          <h3>3. Categorías de cookies que utilizamos</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px", marginBottom: "24px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Categoría</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Para qué sirve</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>¿Requiere su consentimiento?</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={{ padding: "12px", fontWeight: "700" }}>Estrictamente necesarias</td>
                <td style={{ padding: "12px" }}>Permiten el funcionamiento básico del sitio: mantener la sesión, conservar el avance del formulario de solicitud, balancear la carga del servidor, y aplicar medidas de seguridad y prevención de fraude.</td>
                <td style={{ padding: "12px" }}>No. Sin ellas el sitio no funciona.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={{ padding: "12px", fontWeight: "700" }}>De preferencias</td>
                <td style={{ padding: "12px" }}>Recuerdan configuraciones que usted elige, como idioma, plazo preseleccionado o equipo visualizado previamente.</td>
                <td style={{ padding: "12px" }}>Sí.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={{ padding: "12px", fontWeight: "700" }}>Analíticas</td>
                <td style={{ padding: "12px" }}>Nos permiten conocer cuántas personas visitan el sitio, qué secciones consultan y en qué punto abandonan el proceso, con el fin de mejorar el servicio.</td>
                <td style={{ padding: "12px" }}>Sí.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={{ padding: "12px", fontWeight: "700" }}>Publicitarias y de terceros</td>
                <td style={{ padding: "12px" }}>Permiten mostrarle publicidad de Movinex en plataformas externas, medir la efectividad de nuestras campañas y construir audiencias personalizadas.</td>
                <td style={{ padding: "12px" }}>Sí.</td>
              </tr>
            </tbody>
          </table>
          <p>Las cookies estrictamente necesarias se instalan siempre. Las demás categorías solo se activan si usted lo autoriza en el panel de configuración.</p>

          <h3>4. Cookies de terceros</h3>
          <p>Algunas cookies son colocadas por proveedores que nos prestan servicios. Estos terceros pueden tratar la información conforme a sus propias políticas, que le recomendamos consultar:</p>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px", marginBottom: "24px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Proveedor</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Finalidad</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Meta Platforms</td><td style={{ padding: "12px" }}>Medición de campañas publicitarias, atribución de conversiones y construcción de audiencias.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Proveedor de analítica web</td><td style={{ padding: "12px" }}>Estadísticas de tráfico, comportamiento de navegación y puntos de abandono del proceso de solicitud.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Proveedor de infraestructura y hospedaje</td><td style={{ padding: "12px" }}>Seguridad, prevención de fraude y distribución de contenido.</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Conekta y Stripe (procesadores de pago)</td><td style={{ padding: "12px" }}>Seguridad de la transacción, autenticación del medio de pago y prevención de fraude en el cobro. Stripe, Inc. es una entidad establecida en los Estados Unidos de América.</td></tr>
            </tbody>
          </table>

          <h3>5. Cómo configurar sus preferencias</h3>
          <p>Al ingresar por primera vez al sitio se muestra un panel de configuración donde usted puede aceptar todas las cookies, rechazar todas las no necesarias, o elegir por categoría.</p>
          <p>Puede modificar su decisión en cualquier momento desde el enlace “Configuración de cookies” disponible en el pie de página de todas las secciones del sitio.</p>
          <p>Rechazar las cookies no necesarias no impide el uso del sitio, ni afecta la evaluación de su solicitud ni las condiciones de su financiamiento.</p>

          <h3>6. Configuración desde su navegador</h3>
          <p>Adicionalmente, usted puede bloquear o eliminar cookies desde la configuración de su navegador. Tenga en cuenta que bloquear las cookies estrictamente necesarias puede impedir el correcto funcionamiento del sitio, incluido el formulario de solicitud.</p>
          <ul>
            <li>Google Chrome: Configuración › Privacidad y seguridad › Cookies y otros datos de sitios.</li>
            <li>Mozilla Firefox: Ajustes › Privacidad y seguridad › Cookies y datos del sitio.</li>
            <li>Safari: Preferencias › Privacidad › Gestionar datos de sitios web.</li>
            <li>Microsoft Edge: Configuración › Cookies y permisos del sitio.</li>
          </ul>

          <h3>7. Vigencia de las cookies</h3>
          <p>Las cookies de sesión se eliminan al cerrar el navegador. Las cookies persistentes permanecen almacenadas por el plazo definido por cada proveedor, que no excede de 24 meses, salvo que usted las elimine antes. Su elección de preferencias se conserva por un plazo máximo de 12 meses, tras el cual se le volverá a solicitar.</p>

          <h3>8. Datos personales</h3>
          <p>La información obtenida mediante cookies puede constituir dato personal. Su tratamiento, incluidas las transferencias y el almacenamiento en servidores ubicados en Virginia, Estados Unidos, se rige por el Aviso de Privacidad disponible en https://www.movinex.mx/privacidad.</p>
          <p>Usted puede ejercer sus derechos ARCO y revocar su consentimiento escribiendo a privacidad@movinex.mx.</p>

          <h3>9. Cambios a esta Política</h3>
          <p>Esta Política puede actualizarse. La versión vigente será siempre la publicada en https://www.movinex.mx/cookies, con indicación de su fecha de actualización.</p>

          <h3>10. Contacto</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px", marginBottom: "24px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Canal</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Dato</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Privacidad y cookies</td><td style={{ padding: "12px" }}>privacidad@movinex.mx</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Atención general</td><td style={{ padding: "12px" }}>info@movinex.mx</td></tr>
              <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Teléfono y WhatsApp</td><td style={{ padding: "12px" }}>55 5502 8744</td></tr>
            </tbody>
          </table>

          <h3>Anexo. Texto sugerido para el panel de cookies</h3>
          <h4>Primera capa — banner</h4>
          <p>Usamos cookies propias y de terceros para que el sitio funcione, analizar su uso y mostrarte publicidad de Movinex. Puedes aceptar todas, rechazar las no necesarias o configurarlas por categoría. Más información en nuestra Política de Cookies.  [Aceptar todas]  [Rechazar no necesarias]  [Configurar]</p>
          <p><small>Los tres botones deben tener el mismo tamaño, color y jerarquía visual. Un botón de rechazo menos visible que el de aceptación invalida el consentimiento.</small></p>
          
          <h4>Segunda capa — panel de configuración</h4>
          <p>☐  Estrictamente necesarias — siempre activas<br />
          ☐  De preferencias<br />
          ☐  Analíticas<br />
          ☐  Publicitarias y de terceros</p>
          <p><small>Todas las casillas opcionales deben aparecer desmarcadas por defecto.</small></p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.aboutSection}>
      <div className={styles.aboutContent}>
        <span className={styles.eyebrow}>LEGAL</span>
        <h1>Política de Envíos, Garantías y Devoluciones</h1>
        <p>NVX TECHNOLOGIES, S. DE R.L. DE C.V. — MOVINEX  ·  Vigente a partir del 6 de agosto de 2026</p>
        
        <h3>1. Alcance</h3>
        <p>Esta Política regula el envío, la entrega, la garantía, la reposición y las devoluciones de los equipos comercializados por NVX TECHNOLOGIES, S. DE R.L. DE C.V. (“Movinex”) a través de https://movinex.mx. Forma parte integrante de los Términos y Condiciones de Venta a Crédito.</p>

        <h3>2. Envíos</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px", marginBottom: "24px" }}>
          <thead>
            <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Concepto</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Condición</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Cobertura</td><td style={{ padding: "12px" }}>Todo el territorio nacional.</td></tr>
            <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Costo de envío</td><td style={{ padding: "12px" }}>Por cuenta del consumidor. El importe se calcula según el domicilio de entrega y se le muestra desglosado antes de que usted confirme la operación. Movinex puede ofrecer promociones de envío sin costo, sujetas a su vigencia y condiciones.</td></tr>
            <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Plazo máximo de entrega</td><td style={{ padding: "12px" }}>De 3 a 7 días hábiles en zonas metropolitanas y de hasta 12 días hábiles en zonas extendidas o de difícil acceso. El plazo aplicable a su domicilio se le informa antes de que usted confirme la operación.</td></tr>
            <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Inicio del cómputo</td><td style={{ padding: "12px" }}>El día hábil siguiente a la confirmación del pago inicial por el procesador.</td></tr>
            <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Paquetería</td><td style={{ padding: "12px" }}>Empresa de mensajería contratada por Movinex. Movinex opera de forma 100% digital: no cuenta con establecimientos físicos abiertos al público ni con servicio propio de recolección o entrega.</td></tr>
            <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Seguimiento</td><td style={{ padding: "12px" }}>El número de guía se le proporciona a solicitud, dentro de las 24 horas hábiles siguientes, por correo electrónico o WhatsApp. Movinex habilitará el envío automático del número de guía al liberar su aplicación móvil.</td></tr>
            <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Recepción</td><td style={{ padding: "12px" }}>La paquetería puede requerir identificación oficial del titular o de la persona autorizada para recibir el paquete en el domicilio registrado.</td></tr>
          </tbody>
        </table>

        <h4>2.1 Domicilio de entrega</h4>
        <p>Es responsabilidad del consumidor proporcionar un domicilio completo, correcto y accesible. Movinex no responde por retrasos derivados de domicilios incorrectos o incompletos.</p>
        <p>Si tras tres intentos de entrega no es posible completarla por causas imputables al consumidor, el equipo retornará a Movinex y nos comunicaremos para acordar una nueva entrega. Este supuesto no suspende la obligación de pago.</p>
        
        <h4>2.2 Incumplimiento del plazo por Movinex</h4>
        <p>Si la entrega no se realiza dentro del plazo máximo aplicable a su domicilio, comuníquese con Movinex y daremos seguimiento con la paquetería sin costo para usted. Transcurridos 5 días hábiles adicionales a dicho plazo sin que la entrega se concrete, usted podrá optar, a su elección, por: (i) la entrega en un nuevo plazo acordado; o (ii) la cancelación de la operación con devolución íntegra del pago inicial y del costo de envío, sin penalización alguna. La devolución se realiza al mismo medio de pago dentro de los 10 días hábiles siguientes. Movinex responde ante usted por el cumplimiento de la empresa de paquetería que contrata. No le son imputables los retrasos derivados de caso fortuito o fuerza mayor, contingencias climatológicas, bloqueos de vías, ni de domicilios incorrectos, incompletos o inaccesibles.</p>
        
        <h4>2.3 Riesgo durante el traslado</h4>
        <p>El equipo viaja por cuenta y riesgo de Movinex hasta el momento de la entrega. El riesgo se transmite al consumidor a partir de la recepción del equipo.</p>

        <h3>3. Revisión al recibir</h3>
        <p>Le recomendamos revisar el paquete y el equipo al momento de la entrega. Verifique que el empaque no presente daños, que el modelo corresponda al contratado y que el equipo encienda correctamente.</p>
        <p>Cualquier incidencia debe reportarse dentro de las 72 horas siguientes a la entrega a info@movinex.mx o al 55 5502 8744, adjuntando fotografías del empaque y del equipo.</p>

        <h3>4. Reposición sin costo</h3>
        <p>Movinex repone el equipo sin costo alguno para el consumidor en los siguientes supuestos:</p>
        <ul>
          <li>El equipo llega dañado, con el empaque violado o incompleto.</li>
          <li>El equipo entregado no corresponde al modelo, capacidad o color contratado.</li>
          <li>El equipo no enciende o presenta una falla de origen al momento de la entrega.</li>
          <li>El equipo nunca es entregado y se acredita el extravío en tránsito.</li>
        </ul>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px", marginBottom: "24px" }}>
          <thead>
            <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Etapa</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Plazo</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Reporte del consumidor</td><td style={{ padding: "12px" }}>Dentro de las 72 horas siguientes a la entrega.</td></tr>
            <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Respuesta de Movinex</td><td style={{ padding: "12px" }}>Dentro de los 2 días hábiles siguientes al reporte.</td></tr>
            <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Devolución del equipo a Movinex</td><td style={{ padding: "12px" }}>Movinex le envía una guía de envío prepagada; usted únicamente entrega el paquete en la sucursal de paquetería más cercana. Sin costo alguno para usted.</td></tr>
            <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Envío del equipo de reposición</td><td style={{ padding: "12px" }}>Dentro de los 5 días hábiles siguientes a la recepción del equipo devuelto.</td></tr>
          </tbody>
        </table>
        <p>Durante el proceso de reposición, Movinex no cobrará los pagos periódicos correspondientes al periodo en que usted no tuvo el equipo, y recorrerá el calendario de pagos en la misma proporción.</p>

        <h3>5. Garantía</h3>
        <p>Todos los equipos cuentan con 12 meses de garantía contados a partir de la fecha de entrega, otorgada por el fabricante o proveedor autorizado, contra defectos de fabricación y vicios ocultos.</p>
        <p>Movinex gestiona la garantía por usted. No necesita acudir directamente ante el fabricante ni realizar trámite alguno por su cuenta. La gestión no tiene costo.</p>
        
        <h4>5.1 Cómo hacerla efectiva</h4>
        <ol>
          <li>Reporte la falla a info@movinex.mx o al 55 5502 8744, describiendo el problema.</li>
          <li>Movinex le responderá dentro de los 2 días hábiles siguientes con el procedimiento a seguir.</li>
          <li>Movinex le envía por correo electrónico o WhatsApp una guía de envío prepagada, sin costo para usted; únicamente debe entregar el paquete en la sucursal de paquetería más cercana.</li>
          <li>El equipo se repara o se repone conforme al dictamen del fabricante o proveedor.</li>
          <li>Movinex le devuelve el equipo reparado o repuesto a su domicilio, sin costo de envío para usted.</li>
        </ol>

        <h4>5.2 Qué no cubre</h4>
        <ul>
          <li>Daños por golpes, caídas, humedad, contacto con líquidos o sobretensiones eléctricas.</li>
          <li>Daños estéticos que no afecten el funcionamiento.</li>
          <li>Desgaste normal de la batería y de elementos consumibles.</li>
          <li>Reparaciones, aperturas o modificaciones realizadas por talleres no autorizados.</li>
          <li>Daños derivados de la manipulación, remoción o intento de eludir el software del Servicio de Seguridad y Bloqueo.</li>
          <li>Software de terceros instalado por el usuario, y daños derivados de rooteo o desbloqueo del sistema operativo.</li>
          <li>Pérdida, robo o destrucción del equipo.</li>
        </ul>

        <h4>5.3 Efecto sobre sus pagos</h4>
        <p>La obligación de pago del financiamiento no se suspende durante el proceso de garantía. Sin embargo, cuando la reparación o reposición exceda de 30 días naturales contados desde que usted entrega el equipo a la paquetería con la guía prepagada, Movinex no cobrará los pagos periódicos correspondientes al periodo excedente y recorrerá el calendario en la misma proporción.</p>

        <h4>5.4 Respaldo de su información</h4>
        <p>Antes de entregar el equipo para reparación, respalde su información. Movinex y el fabricante no responden por la pérdida de datos, fotografías, contactos o aplicaciones almacenadas en el equipo.</p>

        <h3>6. Devoluciones</h3>
        <p>Derecho de revocación. Por tratarse de una operación celebrada íntegramente por medios electrónicos, usted puede revocar su consentimiento dentro de los cinco días hábiles siguientes a la entrega del equipo, sin responsabilidad alguna, conforme al artículo 56 de la Ley Federal de Protección al Consumidor. Para ejercerlo, comuníquelo a info@movinex.mx dentro de ese plazo y devuelva el equipo completo, con todos sus accesorios y empaque y sin daño, mediante la guía prepagada que Movinex le proporcionará sin costo. Movinex le reintegrará el pago inicial y el costo de envío dentro de los 10 días hábiles siguientes a la recepción del equipo. Concluido ese plazo, no aplica devolución por arrepentimiento ni cancelación del financiamiento una vez que el equipo ha sido entregado y activado.</p>
        <p>Esta limitación no restringe en modo alguno los derechos reconocidos en los numerales 2.2, 4 y 5 de esta Política, ni los derechos que la Ley Federal de Protección al Consumidor otorga al consumidor, los cuales son irrenunciables.</p>
        <p>Usted puede, en cualquier momento y sin penalización, liquidar anticipadamente el saldo insoluto de su financiamiento.</p>

        <h3>7. Robo, extravío o destrucción</h3>
        <p>El Servicio de Seguridad y Bloqueo del Equipo no es un seguro y no cubre la reposición del equipo. El robo, extravío o destrucción del equipo con posterioridad a la entrega no extingue ni suspende la obligación de pago del saldo insoluto.</p>
        <p>En caso de robo o extravío, repórtelo de inmediato a Movinex. Bloquearemos el equipo sin costo para impedir su uso por terceros y evaluaremos, caso por caso, alternativas de reestructura del saldo.</p>

        <h3>8. Contacto y quejas</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px", marginBottom: "24px" }}>
          <thead>
            <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Canal</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "800", color: "#0B1B3C" }}>Dato</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>Movinex — Atención, garantías e incidencias</td><td style={{ padding: "12px" }}>info@movinex.mx · 55 5502 8744 (también WhatsApp)</td></tr>
            <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>PROFECO — Teléfono del Consumidor</td><td style={{ padding: "12px" }}>55 5568 8722 · 800 468 8722</td></tr>
            <tr style={{ borderBottom: "1px solid #F1F5F9" }}><td style={{ padding: "12px", fontWeight: "700" }}>PROFECO — Sitio</td><td style={{ padding: "12px" }}><a href="https://www.gob.mx/profeco" target="_blank" rel="noreferrer">https://www.gob.mx/profeco</a></td></tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
