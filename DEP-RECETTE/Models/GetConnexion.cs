using DBINSTALL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Oracle.ManagedDataAccess.Client;

namespace DEP_RECETTE.Models
{
    public class GetConnexion
    {
        private static string nomServeur;
        private static string nomBase;
        private static string nomUtilisateur;
        private static string motDePasse;
        private static string userSession;
        public static string GetConnectionString()
        {
            if (HttpContext.Current != null && HttpContext.Current.Session["LOGIN"] != null)
            {
                userSession = HttpContext.Current.Session["LOGIN"].ToString();
                BDD.Divers.User = userSession;
            }
            else
            {
                userSession = "";
                BDD.Divers.User = userSession;
            }
            BDD.Divers.Langue = "Fr";
            BDD.Connexion.Serveur = BDD.Connexion.enumServeur.WEB;
            FinproConfig objConfig = new FinproConfig();
            FinproXmlFile objFinproXml = new FinproXmlFile();
            System.Web.UI.Page Page = new System.Web.UI.Page();
            var path = System.Web.Hosting.HostingEnvironment.MapPath("/Configuration.config");
            objFinproXml = objConfig.DecrypterFichierConfig(path, DBINSTALL.FinproConfig.enumTypeFile.FINPRONET);
            bool a = objFinproXml.MultiProjets;
            //int result = a ? 1 : 0;

            nomServeur = HttpContext.Current.Session["NomServeur"]?.ToString() ?? objFinproXml.NomServeur;
            nomBase = HttpContext.Current.Session["NomBase"]?.ToString() ?? objFinproXml.NomBase;
            nomUtilisateur = HttpContext.Current.Session["NomUtilisateur"]?.ToString() ?? objFinproXml.NomUtilisateur;
            motDePasse = HttpContext.Current.Session["MotDePasse"]?.ToString() ?? objFinproXml.MotdePasse;

            BDD.Connexion.NomServeur = nomServeur;
            BDD.Connexion.NomBase = nomBase;
            BDD.Connexion.NomUtilisateur = nomUtilisateur;
            BDD.Connexion.MotdePasse = motDePasse;

            switch (objFinproXml.TypeServeur)
            {
                case DbCreationBase.enumTypeServeur.SQL:
                    BDD.Connexion.TypeServeur = BDD.Connexion.EnumTypeServeur.SQL;
                    break;
                case DbCreationBase.enumTypeServeur.ORACLE:
                    BDD.Connexion.TypeServeur = BDD.Connexion.EnumTypeServeur.ORACLE;
                    break;
                case DbCreationBase.enumTypeServeur.ACCESS:
                    BDD.Connexion.TypeServeur = BDD.Connexion.EnumTypeServeur.ACCESS;
                    break;
            }
            // Construire la chaîne de connexion
            return $"Data Source = {nomServeur}; " +
                   $"database = {nomBase}; " +
                   $"user id = {nomUtilisateur}; " +
                   $"password = {motDePasse};";
        }
    }
}