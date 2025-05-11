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
        public string solde { get; set; }
        public string FLAG { get; set; }
        public string Designation { get; set; }
        public string raisonSociale_1 { get; set; }
        public string raisonSociale_2 { get; set; }
        public string raisonSociale_3 { get; set; }
        public string sigle { get; set; }
        public string adresse_1 { get; set; }
        public string adresse_2 { get; set; }
        public string adresse_3 { get; set; }
        public string ville { get; set; }
        public string pays { get; set; }
        public string telephone_1 { get; set; }
        public string telephone_2 { get; set; }
        public string boitePostale_1 { get; set; }
        public string boitePostale_2 { get; set; }
        public string faxe_1 { get; set; }
        public string faxe_2 { get; set; }
        public string email_1 { get; set; }
        public string email_2 { get; set; }
        public string rc_1 { get; set; }
        public string rc_2 { get; set; }
        public string ninea_1 { get; set; }
        public string ninea_2 { get; set; }
        public string compteBanque_1 { get; set; }
        public string compteBanque_2 { get; set; }
        public string siteWeb_1 { get; set; }
        public string siteWeb_2 { get; set; }
        public string montant { get; set; }
        public string statut { get; set; }
        public string dateDebut { get; set; }
        public string dateFin { get; set; }
        public string dateSaisie { get; set; }
        public string dateValid { get; set; }
        public string UserValid { get; set; }
        public string Signature { get; set; }
        public string sens { get; set; }
        public string page { get; set; }
        public string date1 { get; set; }
        public string date2 { get; set; }
        public string observation { get; set; }
        public string valider { get; set; }
        public string typeSens { get; set; }
        public string typeValid { get; set; }
        public string compteur { get; set; }
        public bool etat { get; set; }
        public long rowIndex { get; set; }
        public bool etatImg1 { get; set; }
        public bool etatImg2 { get; set; }
        public HttpPostedFileBase fileBDD { get; set; }
        public HttpPostedFileWrapper ImageUpload_1 { get; set; }
        public HttpPostedFileWrapper ImageUpload_2 { get; set; }
        public IEnumerable<listOfClass> listOfCaisseAffect { get; set; }
    }
}