-- =====================================================================
-- Panel Hito · seed.sql · Contenido inicial (idempotente)
-- Reejecutable: no duplica ni pisa ediciones del admin.
-- =====================================================================
set search_path = panelhito, public;

-- ---- Administrador inicial (superadmin) -----------------------------
insert into panelhito.admin_profiles (user_id, full_name, role, active)
values ('55e273bb-3bd4-4ce1-9af2-55641324a11c', 'Administrador Panel Hito', 'superadmin', true)
on conflict (user_id) do update set role = 'superadmin', active = true;

-- ---- site_settings (singleton) --------------------------------------
insert into panelhito.site_settings (
  business_name, slogan, business_description, whatsapp_number, phone_display, email,
  address, city, country, instagram_url, facebook_url,
  logo_dark_path, logo_light_path, favicon_path, seo_title, seo_description)
select
  'Panel Hito', 'Paneles termoacústicos · Paraguay',
  'Paneles termoacústicos de alto rendimiento para cubiertas y cerramientos.',
  '595981000000', '+595 981 000 000', 'contacto@panelhito.com.py',
  null, 'Asunción', 'Paraguay', null, 'https://facebook.com/panelhitoparaguay',
  '/brand/PanelHito_blanco.svg', '/brand/PanelHito_cian.svg', '/uploads/PanelHito_isotipo_cian.svg',
  'Panel Hito — Paneles termoacústicos',
  'Paneles termoacústicos para cubiertas, fachadas y cámaras frigoríficas. Aislación térmica y acústica, montaje rápido y asesoramiento técnico en Paraguay.'
where not exists (select 1 from panelhito.site_settings);

-- ---- site_sections --------------------------------------------------
insert into panelhito.site_sections (section_key, eyebrow, title, description, secondary_text, primary_button_label, primary_button_url, secondary_button_label, secondary_button_url, sort_order)
values
 ('hero','Paneles termoacústicos · Paraguay','Construí con mayor eficiencia, confort y protección','Paneles termoacústicos de alto rendimiento para cubiertas y cerramientos. Soluciones resistentes, eficientes y adaptadas a cada proyecto.',null,'Solicitar presupuesto','#contacto','Conocer nuestros paneles','#productos',0),
 ('presentacion','Presentación','Una solución que mejora cada construcción','Panel Hito comercializa paneles termoacústicos para viviendas, comercios, depósitos, industrias y proyectos de construcción. El sistema ayuda a reducir la transferencia de calor, mejorar el aislamiento sonoro y acelerar los tiempos de obra, con una terminación prolija desde el primer día.','Trabajamos junto a arquitectos, constructoras y propietarios para definir el panel adecuado según el uso, la luz entre apoyos y las condiciones del lugar.',null,null,null,null,1),
 ('productos','Productos','Líneas de panel','Espesores, núcleos y terminaciones se confirman con la ficha técnica de cada línea.',null,null,null,null,null,2),
 ('beneficios','Beneficios','Por qué elegir panel termoacústico',null,null,null,null,null,null,3),
 ('aplicaciones','Aplicaciones','Dónde se usa el panel',null,null,null,null,null,null,4),
 ('comparacion','Comparación','Cubierta convencional y solución con panel',null,null,null,null,null,null,5),
 ('proceso','Proceso de atención','Cómo trabajamos tu consulta',null,null,null,null,null,null,6),
 ('proyectos','Proyectos','Nuestros trabajos','Algunas de las obras realizadas con paneles termoacústicos Panel Hito: viviendas, comercios, oficinas, galpones e industria.',null,'Ver más trabajos','/trabajos',null,null,7),
 ('nosotros','Nosotros','Sobre Panel Hito',null,null,null,null,null,null,8),
 ('faq','Preguntas frecuentes','Consultas habituales',null,null,null,null,null,null,9),
 ('cta','','Encontrá la solución adecuada para tu proyecto','Contanos qué necesitás y recibí asesoramiento para elegir el panel termoacústico más conveniente.',null,'Solicitar presupuesto','#contacto','Hablar por WhatsApp',null,10),
 ('contacto','Contacto','Pedí tu presupuesto','Respondemos con la información técnica y comercial que necesites para avanzar.',null,null,null,null,null,11),
 ('footer','','Panel Hito',null,null,null,null,null,null,12)
on conflict (section_key) do nothing;

-- ---- hero_highlights ------------------------------------------------
insert into panelhito.hero_highlights (title, icon_key, sort_order)
select * from (values
 ('Aislación térmica','thermometer',0),
 ('Reducción acústica','ear',1),
 ('Instalación rápida','timer',2),
 ('Alta durabilidad','shield',3)
) v(title, icon_key, sort_order)
where not exists (select 1 from panelhito.hero_highlights);

-- ---- products -------------------------------------------------------
insert into panelhito.products (slug, name, category, short_description, description, applications, thickness_text, core_text, image_path, image_alt, whatsapp_message, featured, published, sort_order)
values
 ('panel-para-cubiertas','Panel para cubiertas','Cubiertas','Panel autoportante para techos con pendiente.','Panel autoportante para techos con pendiente, pensado para reducir el ingreso de calor y resolver la cubierta en una sola operación.',array['Viviendas','Galpones','Depósitos'],'A definir según ficha','A confirmar','/uploads/panel-cubierta.jpg','Panel termoacústico para cubiertas apilado en obra','Hola Panel Hito, quiero consultar por el panel para cubiertas.',true,true,0),
 ('panel-para-fachadas','Panel para fachadas','Fachadas','Cerramiento vertical de junta oculta.','Cerramiento vertical de junta oculta para muros y frentes, con terminación limpia y continua en interior y exterior.',array['Comercios','Oficinas','Industria'],'A definir según ficha','A confirmar','/uploads/panel-fachada.jpg','Interior revestido con panel Panel Hito','Hola Panel Hito, quiero consultar por el panel para fachadas.',true,true,1),
 ('panel-para-camaras-frigorificas','Panel para cámaras frigoríficas','Frío','Paneles con encastre para cámaras de frío.','Paneles con encastre para cámaras de frío y salas de proceso, orientados a mantener la temperatura y facilitar la higiene.',array['Frigoríficos','Agroindustria'],'A definir según ficha','A confirmar','/uploads/panel-camara-frigorifica.jpg','Cámara frigorífica construida con paneles Panel Hito','Hola Panel Hito, quiero consultar por paneles para cámaras frigoríficas.',true,true,2),
 ('paneles-especiales','Paneles especiales','Especiales','Medidas y terminaciones particulares.','Medidas, terminaciones o prestaciones particulares según los requerimientos del proyecto.',array[]::text[],null,null,null,null,'Hola Panel Hito, quiero consultar por paneles especiales.',false,true,3),
 ('accesorios-y-terminaciones','Accesorios y terminaciones','Accesorios','Babetas, cumbreras, perfiles y sellos.','Babetas, cumbreras, perfiles de cierre, tornillería y sellos para completar la instalación.',array[]::text[],null,null,null,null,'Hola Panel Hito, quiero consultar por accesorios y terminaciones.',false,true,4)
on conflict (slug) do nothing;

-- ---- benefits -------------------------------------------------------
insert into panelhito.benefits (title, description, icon_key, sort_order)
select * from (values
 ('Mayor aislamiento térmico','Reduce la transferencia de calor entre el exterior y el interior.','thermometer',0),
 ('Reducción de ruidos exteriores','Mejor confort acústico en ambientes de trabajo y vivienda.','ear',1),
 ('Menor tiempo de instalación','Un solo elemento resuelve estructura de cierre, aislación y terminación.','timer',2),
 ('Excelente resistencia','Comportamiento estable frente al uso intensivo y a la intemperie.','shield',3),
 ('Menor mantenimiento','Superficies simples de limpiar y de conservar en el tiempo.','sparkles',4),
 ('Terminación moderna','Líneas limpias y continuas, sin trabajos posteriores de revestimiento.','ruler',5),
 ('Optimización del consumo energético','Menor exigencia sobre equipos de climatización y refrigeración.','zap',6),
 ('Soluciones adaptables','Configuraciones distintas según el tipo de obra y su exigencia.','layers',7)
) v(title, description, icon_key, sort_order)
where not exists (select 1 from panelhito.benefits);

-- ---- applications ---------------------------------------------------
insert into panelhito.applications (slug, title, description, image_path, image_alt, sort_order)
values
 ('viviendas','Viviendas','Cubiertas más frescas y silenciosas, con obra limpia y plazos cortos.','/uploads/vivienda.jpg','Vivienda construida con paneles Panel Hito',0),
 ('comercios','Comercios','Locales confortables y una terminación prolija a la vista del público.','/uploads/comercios.jpg','Local comercial construido con paneles Panel Hito',1),
 ('depositos','Depósitos','Protección de la mercadería frente a los cambios de temperatura.','/uploads/depositos.jpg','Depósito construido con paneles Panel Hito',2),
 ('galpones','Galpones','Grandes superficies cubiertas con menos estructura y montaje ágil.','/uploads/galpones.jpg','Interior de galpón con cubierta de paneles Panel Hito',3),
 ('industrias','Industrias','Ambientes de producción más estables y con mejor control del ruido.','/uploads/industria-nave.jpg','Nave industrial con paneles Panel Hito',4),
 ('camaras-frigorificas','Cámaras frigoríficas','Cerramientos pensados para sostener la cadena de frío.','/uploads/panel-camara-frigorifica.jpg','Cámara frigorífica con paneles Panel Hito',5),
 ('oficinas','Oficinas','Espacios de trabajo silenciosos y con menor carga térmica.','/uploads/oficinas.jpg','Oficina construida con paneles Panel Hito',6),
 ('agroindustria','Agroindustria','Naves de acopio y proceso con mejor comportamiento térmico.','/uploads/industrias.jpg','Nave agroindustrial con paneles Panel Hito',7)
on conflict (slug) do nothing;

-- ---- comparison_rows ------------------------------------------------
insert into panelhito.comparison_rows (criterion, conventional_value, panel_value, sort_order)
select * from (values
 ('Aislación térmica','Depende de capas adicionales','Integrada en el panel',0),
 ('Confort acústico','Ruido de lluvia y exterior más presente','Atenuación desde el propio cerramiento',1),
 ('Tiempo de instalación','Varias etapas y oficios','Montaje en una sola etapa',2),
 ('Mantenimiento','Revisión de varias capas','Superficie única, control simple',3),
 ('Terminación','Requiere cielorraso o revestimiento','Cara interior terminada',4),
 ('Eficiencia','Mayor exigencia de climatización','Menor carga sobre los equipos',5)
) v(criterion, conventional_value, panel_value, sort_order)
where not exists (select 1 from panelhito.comparison_rows);

-- ---- process_steps --------------------------------------------------
insert into panelhito.process_steps (title, description, sort_order)
select * from (values
 ('Contanos sobre tu proyecto','Tipo de obra, superficie aproximada y ubicación.',0),
 ('Analizamos tus necesidades','Revisamos requerimientos térmicos, acústicos y de montaje.',1),
 ('Preparamos una propuesta','Línea de panel, accesorios y alcance de la provisión.',2),
 ('Coordinamos provisión y entrega','Plazos y logística acordados con la obra.',3)
) v(title, description, sort_order)
where not exists (select 1 from panelhito.process_steps);

-- ---- company_values -------------------------------------------------
insert into panelhito.company_values (title, description, sort_order)
select * from (values
 ('Asesoramiento','Acompañamos la elección técnica según cada obra.',0),
 ('Calidad','Materiales y terminaciones consistentes.',1),
 ('Cumplimiento','Plazos y condiciones acordadas con la obra.',2),
 ('Innovación','Soluciones constructivas modernas y eficientes.',3),
 ('Atención personalizada','Trato directo en cada consulta.',4)
) v(title, description, sort_order)
where not exists (select 1 from panelhito.company_values);

-- ---- faqs -----------------------------------------------------------
insert into panelhito.faqs (question, answer, sort_order)
select * from (values
 ('¿Qué es un panel termoacústico?','Es un elemento constructivo formado por dos caras metálicas y un núcleo aislante entre ellas. Resuelve en una sola pieza el cierre, la aislación térmica, la atenuación del ruido y la terminación.',0),
 ('¿Para qué tipos de construcciones puede utilizarse?','Viviendas, comercios, oficinas, depósitos, galpones, industrias, cámaras frigoríficas y proyectos agroindustriales, tanto en cubiertas como en cerramientos verticales.',1),
 ('¿Qué espesor necesito para mi proyecto?','Depende del uso, del nivel de aislación buscado y de la distancia entre apoyos. Lo definimos junto con vos al analizar la obra y lo confirmamos con la ficha técnica de la línea elegida.',2),
 ('¿Ayuda a reducir el calor?','Sí. El núcleo aislante reduce la transferencia de calor hacia el interior, lo que mejora el confort y baja la exigencia sobre los equipos de climatización.',3),
 ('¿También disminuye el ruido?','Contribuye a atenuar los ruidos exteriores, incluido el impacto de la lluvia sobre la cubierta. El desempeño concreto se indica en la ficha técnica de cada línea.',4),
 ('¿Realizan entregas?','Coordinamos la provisión y la entrega según la ubicación de la obra y el volumen del pedido. Consultanos y te confirmamos plazos y condiciones.',5),
 ('¿Cómo solicito un presupuesto?','Completá el formulario de contacto o escribinos por WhatsApp con el tipo de obra, la superficie aproximada y la ciudad. Con esos datos preparamos la propuesta.',6)
) v(question, answer, sort_order)
where not exists (select 1 from panelhito.faqs);

-- ---- contact_project_types ------------------------------------------
insert into panelhito.contact_project_types (name, sort_order)
select * from (values
 ('Vivienda',0),('Comercio',1),('Depósito o galpón',2),('Industria',3),
 ('Cámara frigorífica',4),('Oficina',5),('Agroindustria',6),('Otro',7)
) v(name, sort_order)
where not exists (select 1 from panelhito.contact_project_types);

-- ---- legal_pages ----------------------------------------------------
insert into panelhito.legal_pages (slug, title, content, last_updated_label, seo_title, seo_description, published)
values (
 'politica-de-privacidad',
 'Política de Privacidad',
 E'En Panel Hito valoramos y respetamos tu privacidad. Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos la información personal que nos proporcionás al utilizar nuestro sitio web y nuestros canales de contacto.\n\n1. Responsable del tratamiento — Panel Hito, con domicilio en Paraguay. Consultas a contacto@panelhito.com.py.\n2. Datos que recopilamos — nombre, correo, teléfono y el contenido de tu consulta; datos técnicos de navegación.\n3. Finalidad — responder consultas, brindar asesoramiento, dar seguimiento y mejorar el sitio.\n4. Base — consentimiento otorgado al enviar la consulta.\n5. WhatsApp — la comunicación por WhatsApp se rige también por las políticas de esa plataforma.\n6. Conservación — durante el tiempo necesario y los plazos legales.\n7. Terceros — no vendemos datos; solo proveedores que asisten la operación.\n8. Cookies — fuentes tipográficas externas; sin cookies de seguimiento publicitario.\n9. Derechos — acceso, rectificación, cancelación y oposición escribiendo a contacto@panelhito.com.py.\n10. Seguridad — medidas razonables de protección.\n11. Cambios — publicaremos la versión vigente en esta página.\n12. Contacto — contacto@panelhito.com.py · +595 981 000 000.',
 'Última actualización: 28 de julio de 2026',
 'Política de Privacidad · Panel Hito',
 'Política de Privacidad de Panel Hito — cómo recopilamos, usamos y protegemos tus datos personales.',
 true)
on conflict (slug) do nothing;

-- ---- navigation_items ----------------------------------------------
insert into panelhito.navigation_items (label, href, location, sort_order)
select * from (values
 ('Inicio','#inicio','header',0),
 ('Productos','#productos','header',1),
 ('Beneficios','#beneficios','header',2),
 ('Aplicaciones','#aplicaciones','header',3),
 ('Proyectos','#proyectos','header',4),
 ('Nosotros','#nosotros','header',5),
 ('Contacto','#contacto','header',6)
) v(label, href, location, sort_order)
where not exists (select 1 from panelhito.navigation_items);
