using DEP_RECETTE.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace DEP_RECETTE.Controllers
{
    public class HomeController : Controller
    {
        SqlCommand com = new SqlCommand();
        SqlDataReader dr;
        SqlConnection con = new SqlConnection(GetConnexion.GetConnectionString());
        parameter parametre = new parameter();
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult account()
        {
            if (Session["LOGIN"] == null)
            {
                return RedirectToAction("Index", "Home");
            }
            else
            {
                return View();
            }
        }
        [HttpPost]
        public JsonResult checkLoginPasswod(parameter objData)
        {
            var login = objData.login;
            int etat = 0;
            try
            {
                TABLES.rUser rUser = new TABLES.rUser();
                var filtre = $"Login = '{login}'";
                DataTable objTable = rUser.RemplirDataTable(filtre);
                if (objTable.Rows.Count > 0)
                {
                    var loginActuel = (string)objTable.Rows[0][TABLES.rUser.GetChamp.Login.ToString()];
                    if (login == loginActuel)
                    {
                        string password = objTable.Rows[0][TABLES.rUser.GetChamp.PassWord.ToString()] as string ?? string.Empty;
                        if (password == "" || password == null)
                        {
                            etat = 1;
                        }
                        else
                        {
                            etat = 2;
                        }
                    }
                    else
                    {
                        etat = 2;
                    }
                }
                else
                {
                    etat = 2;
                }
            }
            catch (Exception ex)
            {

                throw;
            }
            return Json(new { statut = etat }, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public JsonResult login(parameter objData)
        {
            // Initialisation des objets et variables
            try
            {
                TABLES.rUser rUser = new TABLES.rUser();
                bool isAllValid = true, etatCompte = true;
                string result = "";
                var login = objData.login;
                var password = rUser.CryptagePasswor(objData.password);
                var filtre = TABLES.rUser.GetChamp.Login.ToString() + " = '" + login + "'";
                // Récupération des données de l'utilisateur depuis la base de données
                DataTable objTable = rUser.RemplirDataTable(filtre);

                // Vérification si des lignes ont été retournées
                if (objTable.Rows.Count > 0)
                {
                    var loginActuel = (string)objTable.Rows[0][TABLES.rUser.GetChamp.Login.ToString()];
                    if (login == loginActuel)
                    {
                        string passwordActuel = objTable.Rows[0][TABLES.rUser.GetChamp.PassWord.ToString()] as string ?? string.Empty;
                        switch (passwordActuel)
                        {
                            case "":
                            case null:
                                con.Open();
                                com.Connection = con;
                                com.CommandText = "update rUser set PassWord = @password where login = @login";
                                com.Parameters.AddWithValue("@password", password);
                                com.Parameters.AddWithValue("@login", login);
                                dr = com.ExecuteReader();
                                con.Close();
                                etatCompte = (bool)objTable.Rows[0][TABLES.rUser.GetChamp.Actif.ToString()];
                                if (!etatCompte)
                                {
                                    isAllValid = false;
                                }
                                break;
                            default:
                                var filtreConnexion = $"Login = '{login}' and PassWord = '{password}'";
                                DataTable objTabConn = rUser.RemplirDataTable(filtreConnexion);
                                if (password == passwordActuel)
                                {
                                    etatCompte = (bool)objTabConn.Rows[0][TABLES.rUser.GetChamp.Actif.ToString()];
                                    if (!etatCompte)
                                    {
                                        isAllValid = false;
                                    }
                                }
                                else
                                {
                                    isAllValid = false;
                                }
                                break;
                        }
                    }
                    else
                    {
                        isAllValid = false;
                    }
                }
                else
                {
                    isAllValid = false;
                }
                if (isAllValid)
                {
                    if (!etatCompte)
                    {
                        result = "Ce compte est désactivé";
                    }
                    else
                    {
                        Session["LOGIN"] = login;
                        Session["pass"] = objData.password;
                        Session["GROUPE"] = (string)objTable.Rows[0][TABLES.rUser.GetChamp.Groupe.ToString()];
                        TABLES.rGroup rGroup = new TABLES.rGroup();
                        var filtreGroupe = $"Code = '{Session["GROUPE"].ToString()}'";
                        DataTable tabGr = rGroup.RemplirDataTable(filtreGroupe);
                        Session["TypeGroupe"] = (string)tabGr.Rows[0][TABLES.rGroup.GetChamp.Type.ToString()];
                    }
                }
                else
                {
                    result = "Login ou mot de passe incorrect";
                }
                con.Close();
                return Json(new
                {
                    statut = isAllValid,
                    message = result
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {

                throw;
            }
        }
        //Déconnexion
        public ActionResult Logout()
        {
            Session.Abandon();
            FormsAuthentication.SignOut();
            return RedirectToAction("Index");
        }
    }
}