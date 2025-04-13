using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DEP_RECETTE.Models
{
    public class parameter
    {
        public string code { get; set; }
        public string libelle { get; set; }
        public string login { get; set; }
        public string niveau { get; set; }
        public string password { get; set; }
        public string caisse { get; set; }
        public string entree { get; set; }
        public string sortie { get; set; }
        public string Designation { get; set; }
        public string montant { get; set; }
        public string statut { get; set; }
        public string dateDebut { get; set; }
        public string dateFin { get; set; }
        public string dateSaisie { get; set; }
        public string dateValid { get; set; }
        public string UserValid { get; set; }
        public string Signature { get; set; }
        public string sens { get; set; }
        public string observation { get; set; }
        public string valider { get; set; }
        public string typeSens { get; set; }
        public string typeValid { get; set; }
        public bool etat { get; set; }
        public long rowIndex { get; set; }
    }
}