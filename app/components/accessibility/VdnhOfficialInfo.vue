<template>
  <!-- Справочные сведения: опубликованные источники, НЕ результат обследования Russplore. -->
  <section class="rp-vdnh-facts" aria-label="Официальные сведения о доступности ВДНХ">
    <details>
      <summary>
        <span>Сведения ВДНХ и АТОР</span>
        <span class="rp-vdnh-facts-meta">источники и условия</span>
      </summary>
      <div class="rp-vdnh-facts-body">
        <p class="rp-vdnh-facts-note">По опубликованным сведениям, не по замерам Russplore.</p>
        <ul>
          <li><strong>Маршрут.</strong> Для полного «Центрального» маршрута из 11 точек заявлены ровные асфальтированные дорожки, отсутствие лестниц и места отдыха. Длина полного маршрута — около 5 км. Наш четырёхточечный участок отдельно не измерен.</li>
          <li><strong>Туалеты.</strong> ВДНХ указывает доступные кабины в стационарных бесплатных туалетах; заявленное время работы — 10:00–00:00. Ближайший к нашему участку туалет ещё нужно определить.</li>
          <li><strong>Помощь.</strong> На ВДНХ заявлены бесплатный спецтранспорт (9:00–21:00, по заказу) и прокат кресел-колясок (10:00–20:00, при наличии). Информационная служба: <a href="tel:+74955443400">+7 (495) 544-34-00</a>.</li>
        </ul>
        <div class="rp-vdnh-facts-links">
          <a href="https://vdnh.ru/upload/medialibrary/d2e/d2e58838caf136515d795071c9b134f9.pdf" target="_blank" rel="noopener noreferrer">Официальная карта доступности ВДНХ</a>
          <a href="https://accessible.atorus.ru/moskva/VDNH" target="_blank" rel="noopener noreferrer">Описание маршрута АТОР</a>
          <a href="https://vdnh.ru/dostupnaya-sreda/" target="_blank" rel="noopener noreferrer">Сервисы доступности ВДНХ</a>
          <a href="https://vdnh.ru/visitors/services/" target="_blank" rel="noopener noreferrer">Туалеты и инфоцентры</a>
        </div>
        <p class="rp-vdnh-facts-warning"><strong>Перед публикацией как доступного:</strong> проверить непрерывность пути между четырьмя остановками, уклоны и бордюры, состояние покрытия, туалет и отдых. Сведения сверены с сайтами 05.11.2026; выездного обследования не было.</p>
      </div>
    </details>
  </section>
</template>

<style scoped>
.rp-vdnh-facts,.rp-vdnh-facts *{box-sizing:border-box}
.rp-vdnh-facts{margin-top:9px;border:1px solid #deebe6;border-radius:11px;background:#fff;color:#193347;overflow:hidden}
.rp-vdnh-facts summary{display:flex;justify-content:space-between;align-items:center;gap:10px;min-height:42px;padding:11px 13px;cursor:pointer;list-style:none;color:#08796f;font-size:11px;font-weight:800}
.rp-vdnh-facts summary::-webkit-details-marker{display:none}
.rp-vdnh-facts summary:focus-visible{outline:3px solid #79d2c2;outline-offset:-3px}
.rp-vdnh-facts-meta{font-size:10px;font-weight:600;color:#6f8a91;text-align:right}
.rp-vdnh-facts-body{padding:0 13px 13px;border-top:1px solid #eef3f1}
.rp-vdnh-facts-note{margin:10px 0;color:#687f8a;font-size:10px}
.rp-vdnh-facts ul{margin:9px 0 12px;padding-left:18px;color:#4d6774;font-size:11px;line-height:1.65}
.rp-vdnh-facts li+li{margin-top:7px}
.rp-vdnh-facts strong{color:#234653}
.rp-vdnh-facts-links{display:flex;flex-wrap:wrap;gap:7px 12px;margin:10px 0}
.rp-vdnh-facts a{color:#08796f;font-weight:700;text-decoration:underline;text-underline-offset:2px}
.rp-vdnh-facts-links a{font-size:10px}
.rp-vdnh-facts-warning{margin:10px 0 0;padding:10px;border-radius:8px;background:#f4f8f6;color:#667d86;font-size:10px;line-height:1.6}
@media(max-width:520px){.rp-vdnh-facts summary{align-items:flex-start;flex-direction:column;gap:3px}.rp-vdnh-facts-meta{text-align:left}}
</style>
