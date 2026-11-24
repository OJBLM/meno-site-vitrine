(function () {
  "use strict";

  /* ===== RÉGLAGE : adresse qui reçoit les préinscriptions =====
     GitHub Pages ne peut pas enregistrer un formulaire tout seul.
     Crée un formulaire gratuit chez Formspree (ou Brevo, Mailchimp...),
     puis colle ici l'adresse fournie, par exemple : "https://formspree.io/f/xxxxxxxx"
     Tant que ce champ est vide, le site prévient la visiteuse que
     la préinscription n'est pas encore active. */
  var FORM_ENDPOINT = "";

  /* --- Menu mobile --- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* --- Formulaire de préinscription (page preinscription.html) --- */
  var form = document.getElementById("signup-form");
  if (!form) { return; }
  var email = document.getElementById("email");
  var emailError = document.getElementById("email-error");
  var choiceError = document.getElementById("choice-error");
  var status = document.getElementById("form-status");
  var btn = document.getElementById("submit-btn");
  var LABEL = "Valider ma préinscription gratuite";

  function setStatus(state, message) {
    status.setAttribute("data-state", state);
    status.textContent = message;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    emailError.textContent = "";
    choiceError.textContent = "";
    email.removeAttribute("aria-invalid");
    setStatus("idle", "");

    if (form.site_web.value) { return; } /* champ piège anti-robots */

    var value = email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      emailError.textContent = "Saisissez une adresse e-mail valide, par exemple prenom@exemple.fr.";
      email.setAttribute("aria-invalid", "true");
      email.focus();
      return;
    }
    if (!form.precommande_app.checked && !form.newsletter.checked) {
      choiceError.textContent = "Cochez au moins une option pour valider votre préinscription.";
      return;
    }
    if (!FORM_ENDPOINT) {
      setStatus("info", "Les préinscriptions ouvrent très bientôt. Revenez dans quelques jours : votre adresse n'a pas été enregistrée.");
      return;
    }

    var prenom = form.prenom.value.trim();
    btn.disabled = true;
    btn.textContent = "Envoi en cours…";
    fetch(FORM_ENDPOINT, { method: "POST", headers: { "Accept": "application/json" }, body: new FormData(form) })
      .then(function (r) {
        if (!r.ok) { throw new Error("http " + r.status); }
        form.reset();
        form.precommande_app.checked = true;
        form.newsletter.checked = true;
        setStatus("ok", "Merci" + (prenom ? ", " + prenom : "") + " ! Votre préinscription est bien enregistrée. Nous vous écrirons dès le lancement.");
      })
      .catch(function () {
        setStatus("error", "La préinscription n'a pas pu être envoyée. Vérifiez votre connexion et réessayez dans un instant.");
      })
      .finally(function () { btn.disabled = false; btn.textContent = LABEL; });
  });
})();
