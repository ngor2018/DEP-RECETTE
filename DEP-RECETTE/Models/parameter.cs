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
        public string password { get; set; }
        public string description { get; set; }
        public string montant { get; set; }
        public string statut { get; set; }
        public string dateDebut { get; set; }
        public string dateFin { get; set; }
        public string SignatureBase64 { get; set; }
        public bool etat { get; set; }
    }
}