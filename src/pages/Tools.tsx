import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Key, AlertTriangle, Users, Lock, Globe, Terminal, Wifi, Bug, Activity, Wrench, Copy, Check, Info, Loader2 } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useToast } from "@/hooks/use-toast";

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  config: any;
}

const Tools = () => {
  useDocumentTitle("Outils");
  const { toast } = useToast();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [toolResults, setToolResults] = useState<{ [key: string]: any }>({});
  const [toolLoading, setToolLoading] = useState<{ [key: string]: boolean }>({});
  const [copied, setCopied] = useState(false);

  // State for Select components (shadcn Select doesn't populate FormData)
  const [phishingTemplate, setPhishingTemplate] = useState("banking");
  const [phishingDifficulty, setPhishingDifficulty] = useState("medium");
  const [vulnScanType, setVulnScanType] = useState("Security Headers & Configuration");
  const [portScanType, setPortScanType] = useState("Common Ports Scan");
  const [passwordLength, setPasswordLength] = useState(16);
  const [passwordIncludeNumbers, setPasswordIncludeNumbers] = useState(true);
  const [passwordIncludeSpecial, setPasswordIncludeSpecial] = useState(true);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'password': return <Key className="w-5 h-5" />;
      case 'risk': return <AlertTriangle className="w-5 h-5" />;
      case 'phishing': return <Users className="w-5 h-5" />;
      case 'leak': return <Shield className="w-5 h-5" />;
      case 'security': return <Lock className="w-5 h-5" />;
      case 'ssl': return <Globe className="w-5 h-5" />;
      case 'web security': return <Globe className="w-5 h-5" />;
      case 'penetration testing': return <Bug className="w-5 h-5" />;
      case 'network security': return <Wifi className="w-5 h-5" />;
      case 'network analysis': return <Activity className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'password': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'risk': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'phishing': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'leak': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'security': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'ssl': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'web security': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'penetration testing': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'network security': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'network analysis': return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const setToolLoadingState = (toolId: string, isLoading: boolean) => {
    setToolLoading(prev => ({ ...prev, [toolId]: isLoading }));
  };

  // ====== TOOL FUNCTIONS ======

  const generatePassword = async (tool: Tool) => {
    setToolLoadingState(tool.id, true);
    try {
      const { data, error } = await supabase.functions.invoke('security-password-generator', {
        body: {
          length: passwordLength,
          includeNumbers: passwordIncludeNumbers,
          includeSpecialChars: passwordIncludeSpecial,
          includeUppercase: true,
          includeLowercase: true
        }
      });
      if (error) throw error;
      setToolResults(prev => ({ ...prev, [tool.id]: data }));
    } catch (error) {
      console.error('Password generation error:', error);
      setToolResults(prev => ({ ...prev, [tool.id]: { error: 'Erreur lors de la génération' } }));
    } finally {
      setToolLoadingState(tool.id, false);
    }
  };

  const calculateRisk = (tool: Tool, formData: { network: string; users: string; data: string; compliance: string }) => {
    const scores = {
      network: parseInt(formData.network) || 5,
      users: parseInt(formData.users) || 5,
      data: parseInt(formData.data) || 5,
      compliance: parseInt(formData.compliance) || 5
    };

    // Weighted risk score (higher = more risk)
    // Network & Data weigh more
    const weights = { network: 0.3, users: 0.2, data: 0.3, compliance: 0.2 };
    const totalScore = (scores.network * weights.network) + (scores.users * weights.users) +
                       (scores.data * weights.data) + (scores.compliance * weights.compliance);

    let level: string;
    let color: string;
    let recommendations: string[];

    if (totalScore >= 7) {
      level = 'Critique';
      color = 'text-red-400';
      recommendations = [
        'Action immédiate requise sur tous les axes',
        'Audit de sécurité complet recommandé',
        'Mise en place d\'un SOC / SIEM urgente',
        'Revue des politiques de conformité'
      ];
    } else if (totalScore >= 5) {
      level = 'Élevé';
      color = 'text-orange-400';
      recommendations = [
        'Renforcer la formation des utilisateurs',
        'Mettre à jour les politiques de sécurité réseau',
        'Implémenter le chiffrement des données sensibles'
      ];
    } else if (totalScore >= 3) {
      level = 'Moyen';
      color = 'text-yellow-400';
      recommendations = [
        'Maintenir les mises à jour régulières',
        'Planifier des audits périodiques',
        'Sensibiliser davantage les utilisateurs'
      ];
    } else {
      level = 'Faible';
      color = 'text-green-400';
      recommendations = [
        'Bon niveau de sécurité global',
        'Continuer la veille et les mises à jour',
        'Effectuer des tests de pénétration réguliers'
      ];
    }

    // Detail per axis
    const details = Object.entries(scores).map(([key, value]) => {
      const labels: Record<string, string> = {
        network: 'Sécurité réseau',
        users: 'Formation utilisateurs',
        data: 'Protection des données',
        compliance: 'Conformité'
      };
      return {
        label: labels[key],
        score: value,
        status: value >= 7 ? 'Critique' : value >= 5 ? 'À risque' : value >= 3 ? 'Acceptable' : 'Bon'
      };
    });

    setToolResults(prev => ({
      ...prev,
      [tool.id]: { level, score: totalScore.toFixed(1), color, recommendations, details }
    }));
  };

  const simulatePhishing = (tool: Tool) => {
    const scenarios: Record<string, Record<string, { subject: string; body: string; indicators: string[]; redFlags: string[] }>> = {
      banking: {
        easy: {
          subject: "URGENT!! Votre comptes sera suspenduu!! Cliquez ici maintenent!!!",
          body: "Cher client, votre comptes bancaire a ete bloqué. Cliquer ici pour le debloquer: http://banke-france.scam-site.ru/login",
          indicators: [
            "Fautes d'orthographe nombreuses",
            "URL suspecte avec domaine .ru",
            "Urgence artificielle avec ponctuation excessive",
            "Pas de personnalisation (pas de nom)"
          ],
          redFlags: ["Domaine non officiel", "Fautes grossières", "Lien suspect"]
        },
        medium: {
          subject: "Activité inhabituelle détectée sur votre compte",
          body: "Cher client, nous avons détecté une connexion inhabituelle à votre espace bancaire depuis un appareil non reconnu. Veuillez confirmer votre identité en cliquant sur le lien ci-dessous dans les 24h.\n\nhttps://ma-banque-securite.com/verification",
          indicators: [
            "Domaine ressemblant mais différent de l'officiel",
            "Délai de 24h pour créer de l'urgence",
            "Pas de numéro de client mentionné",
            "Lien générique au lieu d'un espace client sécurisé"
          ],
          redFlags: ["Domaine similaire mais faux", "Urgence modérée", "Demande de vérification d'identité"]
        },
        hard: {
          subject: "Mise à jour de sécurité - Authentification renforcée",
          body: "Bonjour,\n\nDans le cadre de la directive européenne DSP2 sur la sécurité des paiements, nous renforçons l'authentification de votre espace client.\n\nMerci de mettre à jour vos informations de sécurité avant le 15 du mois :\nhttps://espace-client.mabanque-secure.fr/dsp2-update\n\nCordialement,\nService Sécurité",
          indicators: [
            "Référence à une vraie directive (DSP2)",
            "Ton professionnel et crédible",
            "URL très similaire à une vraie banque",
            "Signature professionnelle"
          ],
          redFlags: ["Le domaine n'est pas le domaine officiel exact", "Votre banque ne vous demanderait jamais ça par email", "Vérifiez toujours via l'app officielle"]
        }
      },
      social: {
        easy: {
          subject: "Vous avez gagné un iPhone 15!! Reclamez maintenant!",
          body: "Félicitacion! Vous etes le gagnant de notre tirage. Cliquez ici pour reclamer votre prix: http://free-iphone.xyz",
          indicators: [
            "Promesse trop belle pour être vraie",
            "Domaine .xyz suspect",
            "Fautes d'orthographe",
            "Pas de contexte de participation"
          ],
          redFlags: ["Arnaque classique au faux gain", "Aucun concours réel"]
        },
        medium: {
          subject: "Quelqu'un a essayé de se connecter à votre compte Instagram",
          body: "Nous avons bloqué une tentative de connexion à votre compte depuis un appareil Windows à Moscou, Russie.\n\nSi ce n'était pas vous, sécurisez votre compte maintenant :\nhttps://instagram-security-check.com/verify",
          indicators: [
            "Imite les alertes réelles d'Instagram",
            "Localisation précise pour effrayer",
            "Domaine ressemblant mais non officiel"
          ],
          redFlags: ["instagram-security-check.com ≠ instagram.com", "Vérifiez via l'app officielle"]
        },
        hard: {
          subject: "Mise à jour de notre politique de confidentialité",
          body: "Suite aux nouvelles réglementations RGPD, nous mettons à jour notre politique de confidentialité. Votre consentement est requis pour continuer à utiliser nos services.\n\nRevisez et acceptez les modifications :\nhttps://meta-privacy-update.com/consent\n\nL'équipe Meta",
          indicators: [
            "Référence au RGPD (réglmentation réelle)",
            "Imite la communication officielle de Meta",
            "URL professionnelle mais non officielle",
            "Menace implicite de perte de service"
          ],
          redFlags: ["meta-privacy-update.com ≠ meta.com", "Meta ne demande jamais de consentement par email avec lien"]
        }
      },
      work: {
        easy: {
          subject: "Votre mot de passe expire aujourd'hui!!!",
          body: "Votre mot de passe Office 365 expire dans 1 heure. Cliquez ici pour le renouveler immédiatement: http://office365-renew.tk/password",
          indicators: [
            "Domaine .tk gratuit (suspect)",
            "Urgence extrême (1 heure)",
            "Les mots de passe ne 'expirent' pas comme ça",
            "Pas de signature d'administrateur IT"
          ],
          redFlags: ["Domaine frauduleux", "Fausse urgence"]
        },
        medium: {
          subject: "Document urgent nécessitant votre signature électronique",
          body: "Bonjour,\n\nUn document important attend votre signature via DocuSign. Il s'agit de l'avenant à votre contrat.\n\nSignez ici : https://docusign-documents.net/sign/abc123\n\nCordialement,\nService RH",
          indicators: [
            "Imite DocuSign (service réel)",
            "Contexte professionnel crédible",
            "URL similaire mais différente de docusign.com"
          ],
          redFlags: ["docusign-documents.net ≠ docusign.com", "Vérifiez avec votre service RH par téléphone"]
        },
        hard: {
          subject: "Invitation - Réunion stratégique Q4 2025",
          body: "Bonjour,\n\nVeuillez trouver ci-joint l'ordre du jour de la réunion stratégique Q4.\n\nAccédez aux documents préparatoires sur notre SharePoint :\nhttps://sharepoint-enterprise.com/sites/strategy-q4\n\nMerci de les consulter avant jeudi.\n\nBien cordialement,\nDirection Générale",
          indicators: [
            "Contexte très crédible et professionnel",
            "Référence à SharePoint (outil réel)",
            "Ton formel approprié",
            "Domaine qui ressemble à un vrai SharePoint"
          ],
          redFlags: ["sharepoint-enterprise.com n'est pas votre vrai domaine SharePoint", "Vérifiez l'URL de votre SharePoint interne", "Contactez l'expéditeur par un autre canal"]
        }
      }
    };

    const scenario = scenarios[phishingTemplate]?.[phishingDifficulty];
    if (!scenario) {
      setToolResults(prev => ({ ...prev, [tool.id]: { error: "Scénario non trouvé" } }));
      return;
    }

    setToolResults(prev => ({
      ...prev,
      [tool.id]: {
        ...scenario,
        template: phishingTemplate,
        difficulty: phishingDifficulty
      }
    }));
  };

  const checkDataLeak = async (tool: Tool, email: string) => {
    if (!email || !email.includes('@')) {
      toast({ title: "Email invalide", variant: "destructive" });
      return;
    }
    setToolLoadingState(tool.id, true);
    try {
      const { data, error } = await supabase.functions.invoke('security-breach-checker', {
        body: { email }
      });
      if (error) throw error;
      setToolResults(prev => ({ ...prev, [tool.id]: data }));
    } catch (error) {
      console.error('Breach check error:', error);
      setToolResults(prev => ({
        ...prev,
        [tool.id]: { error: 'Erreur de vérification', isCompromised: false, breachCount: 0, breaches: [] }
      }));
    } finally {
      setToolLoadingState(tool.id, false);
    }
  };

  const analyzeHeaders = async (tool: Tool, url: string) => {
    if (!url) { toast({ title: "URL requise", variant: "destructive" }); return; }
    setToolLoadingState(tool.id, true);
    try {
      const { data, error } = await supabase.functions.invoke('security-header-analyzer', { body: { url } });
      if (error) throw error;
      setToolResults(prev => ({ ...prev, [tool.id]: data }));
    } catch (error) {
      console.error('Header analysis error:', error);
      setToolResults(prev => ({ ...prev, [tool.id]: { error: 'Erreur d\'analyse' } }));
    } finally {
      setToolLoadingState(tool.id, false);
    }
  };

  const testSSL = async (tool: Tool, domain: string) => {
    if (!domain) { toast({ title: "Domaine requis", variant: "destructive" }); return; }
    setToolLoadingState(tool.id, true);
    try {
      const { data, error } = await supabase.functions.invoke('security-ssl-checker', { body: { domain } });
      if (error) throw error;
      setToolResults(prev => ({ ...prev, [tool.id]: data }));
    } catch (error) {
      console.error('SSL test error:', error);
      setToolResults(prev => ({ ...prev, [tool.id]: { error: 'Erreur de test SSL' } }));
    } finally {
      setToolLoadingState(tool.id, false);
    }
  };

  const scanVulnerabilities = async (tool: Tool, target: string) => {
    if (!target) { toast({ title: "URL cible requise", variant: "destructive" }); return; }
    setToolLoadingState(tool.id, true);
    try {
      const { data, error } = await supabase.functions.invoke('security-vulnerability-scanner', {
        body: { target, scanType: vulnScanType }
      });
      if (error) throw error;
      setToolResults(prev => ({ ...prev, [tool.id]: data }));
    } catch (error) {
      console.error('Vulnerability scan error:', error);
      setToolResults(prev => ({
        ...prev,
        [tool.id]: { error: 'Erreur de scan', vulnerabilities: [], riskLevel: 'Unknown' }
      }));
    } finally {
      setToolLoadingState(tool.id, false);
    }
  };

  const scanPorts = async (tool: Tool, target: string) => {
    if (!target) { toast({ title: "Cible requise", variant: "destructive" }); return; }
    setToolLoadingState(tool.id, true);
    try {
      const { data, error } = await supabase.functions.invoke('security-port-scanner', {
        body: { target, scanType: portScanType }
      });
      if (error) throw error;
      setToolResults(prev => ({ ...prev, [tool.id]: data }));
    } catch (error) {
      console.error('Port scan error:', error);
      setToolResults(prev => ({
        ...prev,
        [tool.id]: { error: 'Erreur de scan', openPorts: [], statistics: { totalScanned: 0, openPorts: 0, closedPorts: 0 } }
      }));
    } finally {
      setToolLoadingState(tool.id, false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copié dans le presse-papiers" });
  };

  // ====== RENDER TOOL INTERFACES ======

  const renderToolInterface = (tool: Tool) => {
    const isLoading = toolLoading[tool.id] || false;
    const result = toolResults[tool.id];

    switch (tool.category.toLowerCase()) {
      case 'password':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Longueur : {passwordLength}</Label>
                <input
                  type="range"
                  min={12}
                  max={64}
                  value={passwordLength}
                  onChange={(e) => setPasswordLength(parseInt(e.target.value))}
                  className="w-full mt-1 accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>12</span><span>64</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={passwordIncludeNumbers} onChange={(e) => setPasswordIncludeNumbers(e.target.checked)} className="accent-primary" />
                  Chiffres
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={passwordIncludeSpecial} onChange={(e) => setPasswordIncludeSpecial(e.target.checked)} className="accent-primary" />
                  Spéciaux
                </label>
              </div>
            </div>
            <Button onClick={() => generatePassword(tool)} className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
              Générer un mot de passe
            </Button>
            {result && !result.error && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div>
                  <Label className="text-sm font-medium">Mot de passe généré :</Label>
                  <div className="mt-2 p-2 bg-background rounded border font-mono text-sm flex items-center justify-between gap-2">
                    <span className="select-all break-all">{result.password}</span>
                    <button onClick={() => copyToClipboard(result.password)} className="shrink-0 p-1 hover:text-primary transition-colors">
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-background rounded border">
                    <div className={`font-bold ${
                      result.strength === 'Très fort' ? 'text-green-400' :
                      result.strength === 'Fort' ? 'text-blue-400' :
                      result.strength === 'Moyen' ? 'text-yellow-400' : 'text-red-400'
                    }`}>{result.strength}</div>
                    <div className="text-xs text-muted-foreground">Force</div>
                  </div>
                  <div className="text-center p-2 bg-background rounded border">
                    <div className="font-bold">{result.entropy} bits</div>
                    <div className="text-xs text-muted-foreground">Entropie</div>
                  </div>
                  <div className="text-center p-2 bg-background rounded border">
                    <div className="font-bold">{result.length} chars</div>
                    <div className="text-xs text-muted-foreground">Longueur</div>
                  </div>
                </div>
              </div>
            )}
            {result?.error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">{result.error}</div>
            )}
          </div>
        );

      case 'risk':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.target as HTMLFormElement);
            calculateRisk(tool, {
              network: fd.get('network') as string,
              users: fd.get('users') as string,
              data: fd.get('data') as string,
              compliance: fd.get('compliance') as string
            });
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'network', label: 'Risque réseau (1-10)', hint: '10 = très risqué' },
                { name: 'users', label: 'Risque utilisateurs (1-10)', hint: '10 = pas formés' },
                { name: 'data', label: 'Risque données (1-10)', hint: '10 = pas protégées' },
                { name: 'compliance', label: 'Risque conformité (1-10)', hint: '10 = non conforme' }
              ].map(field => (
                <div key={field.name}>
                  <Label htmlFor={field.name} className="text-sm">{field.label}</Label>
                  <Input name={field.name} type="number" min="1" max="10" defaultValue="5" className="mt-1" />
                  <span className="text-xs text-muted-foreground">{field.hint}</span>
                </div>
              ))}
            </div>
            <Button type="submit" className="w-full">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Calculer le risque
            </Button>
            {result && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${result.color}`}>{result.level}</div>
                  <div className="text-sm text-muted-foreground">Score de risque : {result.score}/10</div>
                </div>
                {result.details && (
                  <div className="space-y-2">
                    {result.details.map((d: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-sm p-2 bg-background rounded">
                        <span>{d.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{d.score}/10</span>
                          <Badge variant={d.score >= 7 ? 'destructive' : d.score >= 5 ? 'default' : 'secondary'} className="text-xs">
                            {d.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {result.recommendations && (
                  <div className="p-3 bg-background rounded border">
                    <div className="font-semibold text-sm mb-2">Recommandations :</div>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      {result.recommendations.map((rec: string, i: number) => (
                        <li key={i}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </form>
        );

      case 'phishing':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Type de scénario</Label>
                <Select value={phishingTemplate} onValueChange={setPhishingTemplate}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banking">Bancaire</SelectItem>
                    <SelectItem value="social">Réseaux sociaux</SelectItem>
                    <SelectItem value="work">Professionnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Difficulté</Label>
                <Select value={phishingDifficulty} onValueChange={setPhishingDifficulty}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Facile à détecter</SelectItem>
                    <SelectItem value="medium">Moyen</SelectItem>
                    <SelectItem value="hard">Difficile à détecter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => simulatePhishing(tool)} className="w-full">
              <Users className="w-4 h-4 mr-2" />
              Générer un scénario éducatif
            </Button>
            {result && !result.error && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="p-3 bg-background rounded border">
                  <div className="text-xs text-muted-foreground mb-1 font-semibold">Objet du mail :</div>
                  <div className="text-sm font-medium">{result.subject}</div>
                </div>
                <div className="p-3 bg-background rounded border">
                  <div className="text-xs text-muted-foreground mb-1 font-semibold">Corps du message :</div>
                  <div className="text-sm whitespace-pre-line">{result.body}</div>
                </div>
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                  <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Indices à repérer :
                  </div>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {result.indicators.map((ind: string, i: number) => (
                      <li key={i}>🔍 {ind}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
                  <div className="font-semibold text-sm mb-2">🚩 Red Flags :</div>
                  <ul className="text-xs space-y-1">
                    {result.redFlags.map((flag: string, i: number) => (
                      <li key={i} className="text-red-400">⚠️ {flag}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-xs text-muted-foreground text-center italic">
                  ⚠️ Ceci est un exemple éducatif pour apprendre à identifier le phishing.
                </div>
              </div>
            )}
          </div>
        );

      case 'leak':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const email = (new FormData(e.target as HTMLFormElement)).get('email') as string;
            checkDataLeak(tool, email);
          }} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm">Adresse email</Label>
              <Input name="email" type="email" placeholder="votre@email.com" required className="mt-1" />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
              Vérifier les fuites
            </Button>
            <div className="p-2 bg-muted/50 rounded text-xs text-muted-foreground flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Simulation éducative basée sur des fuites de données publiques connues. Pour une vérification réelle, utilisez <a href="https://haveibeenpwned.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">HaveIBeenPwned.com</a>.</span>
            </div>
            {result && !result.error && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                {result.isCompromised ? (
                  <>
                    <div className="text-red-400 font-semibold">
                      ⚠️ {result.breachCount} fuite(s) de données détectée(s)
                    </div>
                    <div className="space-y-2">
                      {result.breaches.map((breach: any, idx: number) => (
                        <div key={idx} className="p-2 bg-background rounded border border-red-500/20">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{breach.name}</div>
                              <div className="text-xs text-muted-foreground">{breach.date}</div>
                            </div>
                            <Badge variant="destructive">{breach.severity}</Badge>
                          </div>
                          <div className="text-xs mt-1 text-muted-foreground">
                            {breach.records.toLocaleString()} enregistrements affectés
                          </div>
                          <div className="text-xs mt-1">
                            Données : {breach.dataTypes.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold mb-2">Recommandations :</div>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {result.recommendations?.map((rec: string, idx: number) => (
                          <li key={idx}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="text-green-400">
                    <div className="font-semibold">✅ Aucune fuite détectée</div>
                    <div className="text-sm mt-2 text-muted-foreground">
                      Votre email n'apparaît pas dans les fuites de données connues de notre base.
                    </div>
                  </div>
                )}
              </div>
            )}
            {result?.error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">{result.error}</div>
            )}
          </form>
        );

      case 'security':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const url = (new FormData(e.target as HTMLFormElement)).get('url') as string;
            analyzeHeaders(tool, url);
          }} className="space-y-4">
            <div>
              <Label htmlFor="url" className="text-sm">URL du site web</Label>
              <Input name="url" type="url" placeholder="https://example.com" required className="mt-1" />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
              Analyser les en-têtes de sécurité
            </Button>
            {result && !result.error && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <div className="font-semibold">Score : {result.score}%</div>
                  <Badge className={
                    result.grade?.startsWith('A') ? 'bg-green-500' :
                    result.grade?.startsWith('B') ? 'bg-blue-500' :
                    result.grade?.startsWith('C') ? 'bg-yellow-500' :
                    'bg-red-500'
                  }>
                    {result.grade}
                  </Badge>
                </div>
                {result.securityHeaders && (
                  <div className="space-y-2">
                    {Object.entries(result.securityHeaders).map(([header, info]: [string, any]) => (
                      <div key={header} className="flex justify-between items-center p-2 bg-background rounded">
                        <div>
                          <div className="text-sm font-medium">{header}</div>
                          <div className="text-xs text-muted-foreground">{info.description}</div>
                        </div>
                        <span className={info.present ? 'text-green-400' : 'text-red-400'}>
                          {info.present ? '✅' : '❌'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {result.recommendations?.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                    <div className="font-semibold text-sm mb-2">Recommandations :</div>
                    <ul className="text-xs space-y-1">
                      {result.recommendations.map((rec: any, idx: number) => (
                        <li key={idx}>• {rec.header}: {rec.description}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {result?.error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">{result.error}</div>
            )}
          </form>
        );

      case 'ssl':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const domain = (new FormData(e.target as HTMLFormElement)).get('domain') as string;
            testSSL(tool, domain);
          }} className="space-y-4">
            <div>
              <Label htmlFor="domain" className="text-sm">Nom de domaine</Label>
              <Input name="domain" type="text" placeholder="example.com" required className="mt-1" />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
              Tester SSL/TLS
            </Button>
            {result && !result.error && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <div className="font-semibold">Score : {result.score}%</div>
                  <Badge className={
                    result.grade?.startsWith('A') ? 'bg-green-500' :
                    result.grade?.startsWith('B') ? 'bg-blue-500' :
                    result.grade?.startsWith('C') ? 'bg-yellow-500' :
                    'bg-red-500'
                  }>
                    {result.grade}
                  </Badge>
                </div>
                {result.ssl?.enabled && (
                  <>
                    <div className="p-2 bg-background rounded">
                      <div className="font-semibold text-sm">Protocole :</div>
                      <div className="text-sm">{result.ssl.protocol}</div>
                    </div>
                    <div className="p-2 bg-background rounded">
                      <div className="font-semibold text-sm">HSTS :</div>
                      <div className="text-sm">
                        {result.ssl.hsts?.enabled ?
                          `Activé (max-age: ${result.ssl.hsts.maxAge}s)` :
                          'Non configuré'}
                      </div>
                    </div>
                  </>
                )}
                {result.issues?.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                    <div className="font-semibold text-sm mb-2">Problèmes détectés :</div>
                    <ul className="text-xs space-y-1">
                      {result.issues.map((issue: any, idx: number) => (
                        <li key={idx} className={
                          issue.severity === 'critical' ? 'text-red-400' :
                          issue.severity === 'high' ? 'text-orange-400' :
                          'text-yellow-400'
                        }>
                          • [{issue.severity.toUpperCase()}] {issue.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {result?.error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">{result.error}</div>
            )}
          </form>
        );

      case 'web security':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const target = (new FormData(e.target as HTMLFormElement)).get('target') as string;
            scanVulnerabilities(tool, target);
          }} className="space-y-4">
            <div>
              <Label htmlFor="target" className="text-sm">URL cible</Label>
              <Input name="target" type="url" placeholder="https://example.com" required className="mt-1" />
            </div>
            <div>
              <Label className="text-sm">Type de scan</Label>
              <Select value={vulnScanType} onValueChange={setVulnScanType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Security Headers & Configuration">En-têtes et configuration</SelectItem>
                  <SelectItem value="Full Security Audit">Audit de sécurité complet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Bug className="w-4 h-4 mr-2" />}
              Lancer le scan de vulnérabilités
            </Button>
            {result && !result.error && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <div className="font-semibold">Scan terminé</div>
                  <Badge className={
                    result.riskLevel === 'Low' ? 'bg-green-500' :
                    result.riskLevel === 'Medium' ? 'bg-yellow-500' :
                    result.riskLevel === 'High' ? 'bg-orange-500' :
                    'bg-red-500'
                  }>
                    Risque : {result.riskLevel}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-background rounded text-center">
                    <div className="font-bold">{result.totalFound}</div>
                    <div className="text-xs text-muted-foreground">Vulnérabilités</div>
                  </div>
                  <div className="p-2 bg-background rounded text-center">
                    <div className="font-bold">{result.checksPerformed}</div>
                    <div className="text-xs text-muted-foreground">Tests effectués</div>
                  </div>
                </div>
                {result.vulnerabilities?.map((vuln: any, idx: number) => (
                  <div key={idx} className="p-2 bg-background rounded border border-red-500/20">
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-sm">{vuln.type}</div>
                      <Badge variant={vuln.severity === 'HIGH' ? 'destructive' : vuln.severity === 'MEDIUM' ? 'default' : 'secondary'} className="text-xs">
                        {vuln.severity}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{vuln.description}</div>
                  </div>
                ))}
              </div>
            )}
            {result?.error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">{result.error}</div>
            )}
          </form>
        );

      case 'penetration testing':
        return (
          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded text-xs text-muted-foreground flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Référence éducative sur les outils de test d'intrusion. Aucune attaque réelle n'est effectuée.</span>
            </div>
            <Tabs defaultValue="exploits" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="exploits">Exploits connus</TabsTrigger>
                <TabsTrigger value="methodology">Méthodologie</TabsTrigger>
                <TabsTrigger value="tools">Outils</TabsTrigger>
              </TabsList>
              <TabsContent value="exploits" className="space-y-2 mt-4">
                {[
                  { name: 'EternalBlue (MS17-010)', cve: 'CVE-2017-0144', severity: 'CRITICAL', desc: 'Exploitation du protocole SMBv1 de Windows. Utilisé par WannaCry et NotPetya.', remediation: 'Appliquer le patch MS17-010, désactiver SMBv1' },
                  { name: 'Log4Shell', cve: 'CVE-2021-44228', severity: 'CRITICAL', desc: 'Exécution de code à distance via Apache Log4j. Affecte des millions de serveurs Java.', remediation: 'Mettre à jour Log4j vers 2.17.1+' },
                  { name: 'Heartbleed', cve: 'CVE-2014-0160', severity: 'HIGH', desc: 'Fuite de mémoire dans OpenSSL. Permet d\'extraire clés privées et données sensibles.', remediation: 'Mettre à jour OpenSSL, régénérer les certificats' },
                  { name: 'Shellshock', cve: 'CVE-2014-6271', severity: 'HIGH', desc: 'Injection de commandes via Bash. Exploitable sur les serveurs web utilisant CGI.', remediation: 'Mettre à jour Bash vers une version patchée' },
                  { name: 'ProxyLogon', cve: 'CVE-2021-26855', severity: 'CRITICAL', desc: 'RCE sur Microsoft Exchange. Permet l\'accès complet au serveur de messagerie.', remediation: 'Appliquer les mises à jour Exchange, vérifier les compromissions' },
                ].map((exploit, idx) => (
                  <div key={idx} className="p-3 bg-background rounded border">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-sm">{exploit.name}</div>
                      <Badge variant={exploit.severity === 'CRITICAL' ? 'destructive' : 'default'} className="text-xs">
                        {exploit.severity}
                      </Badge>
                    </div>
                    <div className="text-xs text-primary font-mono mb-1">{exploit.cve}</div>
                    <div className="text-xs text-muted-foreground">{exploit.desc}</div>
                    <div className="text-xs mt-2 text-green-400">✅ Remédiation : {exploit.remediation}</div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="methodology" className="space-y-3 mt-4">
                {[
                  { phase: '1. Reconnaissance', desc: 'Collecte d\'informations passives (OSINT) et actives (scan réseau)', tools: 'Nmap, Shodan, theHarvester, Maltego' },
                  { phase: '2. Scanning', desc: 'Identification des services, versions et vulnérabilités', tools: 'Nmap, Nessus, OpenVAS, Nikto' },
                  { phase: '3. Exploitation', desc: 'Tentative d\'exploitation des vulnérabilités identifiées', tools: 'Metasploit, Burp Suite, SQLmap' },
                  { phase: '4. Post-exploitation', desc: 'Élévation de privilèges, pivoting, exfiltration', tools: 'Mimikatz, BloodHound, Cobalt Strike' },
                  { phase: '5. Rapport', desc: 'Documentation des findings avec preuves et recommandations', tools: 'Dradis, Serpico' },
                ].map((phase, idx) => (
                  <div key={idx} className="p-3 bg-background rounded border">
                    <div className="font-medium text-sm mb-1">{phase.phase}</div>
                    <div className="text-xs text-muted-foreground">{phase.desc}</div>
                    <div className="text-xs mt-1"><span className="text-primary">Outils :</span> {phase.tools}</div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="tools" className="space-y-2 mt-4">
                {[
                  { name: 'Metasploit Framework', category: 'Exploitation', desc: 'Framework de test d\'intrusion le plus utilisé. Contient +2000 exploits.' },
                  { name: 'Burp Suite', category: 'Web Security', desc: 'Proxy d\'interception pour tester la sécurité des applications web.' },
                  { name: 'Nmap', category: 'Scanning', desc: 'Scanner réseau et de ports. Détection d\'OS et de services.' },
                  { name: 'Wireshark', category: 'Network Analysis', desc: 'Analyseur de protocoles réseau. Capture et inspection de paquets.' },
                  { name: 'John the Ripper', category: 'Password Cracking', desc: 'Outil de craquage de mots de passe par dictionnaire et brute force.' },
                  { name: 'Hashcat', category: 'Password Cracking', desc: 'Craquage de hash GPU-acceleré. Supporte 300+ types de hash.' },
                ].map((t, idx) => (
                  <div key={idx} className="p-3 bg-background rounded border flex items-start gap-3">
                    <Terminal className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">{t.name}</div>
                      <Badge variant="outline" className="text-xs my-1">{t.category}</Badge>
                      <div className="text-xs text-muted-foreground">{t.desc}</div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'network security':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const target = (new FormData(e.target as HTMLFormElement)).get('target') as string;
            scanPorts(tool, target);
          }} className="space-y-4">
            <div>
              <Label htmlFor="target" className="text-sm">Cible (domaine ou IP)</Label>
              <Input name="target" placeholder="example.com" required className="mt-1" />
            </div>
            <div>
              <Label className="text-sm">Type de scan</Label>
              <Select value={portScanType} onValueChange={setPortScanType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Common Ports Scan">Ports courants (top 10)</SelectItem>
                  <SelectItem value="Full Port Scan">Scan étendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wifi className="w-4 h-4 mr-2" />}
              Lancer le scan de ports
            </Button>
            {result && !result.error && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-background rounded">
                    <div className="font-bold">{result.statistics?.totalScanned}</div>
                    <div className="text-xs text-muted-foreground">Scannés</div>
                  </div>
                  <div className="text-center p-2 bg-background rounded">
                    <div className="font-bold text-green-400">{result.statistics?.openPorts}</div>
                    <div className="text-xs text-muted-foreground">Ouverts</div>
                  </div>
                  <div className="text-center p-2 bg-background rounded">
                    <div className="font-bold">{result.statistics?.closedPorts}</div>
                    <div className="text-xs text-muted-foreground">Fermés</div>
                  </div>
                </div>
                {result.openPorts?.length > 0 && (
                  <div>
                    <div className="font-semibold text-sm mb-2">Ports ouverts :</div>
                    <div className="space-y-1">
                      {result.openPorts.map((port: any, idx: number) => (
                        <div key={idx} className="p-2 bg-background rounded text-xs flex justify-between items-center">
                          <div>
                            <span className="font-medium">Port {port.port}</span> — {port.service}
                          </div>
                          <Badge variant="outline" className="text-xs">{port.category}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {result.securityIssues?.length > 0 && (
                  <div>
                    <div className="font-semibold text-sm mb-2 text-red-400">⚠️ Problèmes de sécurité :</div>
                    <div className="space-y-1">
                      {result.securityIssues.map((issue: any, idx: number) => (
                        <div key={idx} className="p-2 bg-background rounded border border-red-500/20 text-xs">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium">{issue.issue}</span>
                            <Badge variant="destructive" className="text-xs">{issue.severity}</Badge>
                          </div>
                          <div className="text-muted-foreground">{issue.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {result?.error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">{result.error}</div>
            )}
          </form>
        );

      case 'network analysis':
        return (
          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded text-xs text-muted-foreground flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Référence éducative sur l'analyse réseau. La capture de paquets nécessite un accès local au réseau (non réalisable depuis un navigateur).</span>
            </div>
            <Tabs defaultValue="protocols" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="protocols">Protocoles</TabsTrigger>
                <TabsTrigger value="attacks">Attaques réseau</TabsTrigger>
                <TabsTrigger value="defense">Défense</TabsTrigger>
              </TabsList>
              <TabsContent value="protocols" className="space-y-2 mt-4">
                {[
                  { name: 'TCP/IP', port: '—', desc: 'Protocole de transport fiable avec connexion. Base d\'Internet.', risk: 'SYN Flood, TCP Reset' },
                  { name: 'UDP', port: '—', desc: 'Protocole de transport sans connexion. Utilisé pour DNS, VoIP, streaming.', risk: 'UDP Flood, Amplification' },
                  { name: 'HTTP/HTTPS', port: '80/443', desc: 'Protocole web. HTTPS ajoute le chiffrement TLS.', risk: 'Man-in-the-Middle si HTTP' },
                  { name: 'DNS', port: '53', desc: 'Résolution de noms de domaine en adresses IP.', risk: 'DNS Spoofing, DNS Tunneling' },
                  { name: 'SSH', port: '22', desc: 'Accès distant sécurisé avec chiffrement.', risk: 'Brute force, vol de clés' },
                  { name: 'SMB', port: '445', desc: 'Partage de fichiers Windows.', risk: 'EternalBlue, ransomware' },
                  { name: 'ARP', port: 'L2', desc: 'Résolution d\'adresses MAC sur un réseau local.', risk: 'ARP Spoofing / Poisoning' },
                ].map((proto, idx) => (
                  <div key={idx} className="p-3 bg-background rounded border">
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-sm">{proto.name}</div>
                      <Badge variant="outline" className="text-xs font-mono">{proto.port}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{proto.desc}</div>
                    <div className="text-xs mt-1 text-orange-400">⚠️ Risque : {proto.risk}</div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="attacks" className="space-y-2 mt-4">
                {[
                  { name: 'Man-in-the-Middle (MITM)', desc: 'Interception du trafic entre deux parties. L\'attaquant se place entre la victime et le serveur.', prevention: 'Utiliser HTTPS, HSTS, certificats pinning' },
                  { name: 'ARP Spoofing', desc: 'Falsification des tables ARP pour rediriger le trafic réseau local.', prevention: 'ARP statique, Dynamic ARP Inspection, 802.1X' },
                  { name: 'DNS Poisoning', desc: 'Injection de fausses réponses DNS pour rediriger vers des sites malveillants.', prevention: 'DNSSEC, DNS over HTTPS (DoH)' },
                  { name: 'DDoS', desc: 'Saturation d\'un service par un volume massif de requêtes distribuées.', prevention: 'CDN, rate limiting, filtrage BGP' },
                  { name: 'VLAN Hopping', desc: 'Échappement de VLAN pour accéder à des segments réseau non autorisés.', prevention: 'Désactiver DTP, trunk natif sécurisé' },
                ].map((attack, idx) => (
                  <div key={idx} className="p-3 bg-background rounded border">
                    <div className="font-medium text-sm">{attack.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{attack.desc}</div>
                    <div className="text-xs mt-2 text-green-400">✅ Prévention : {attack.prevention}</div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="defense" className="space-y-2 mt-4">
                {[
                  { name: 'Segmentation réseau', desc: 'Séparer les réseaux par VLANs et zones de sécurité (DMZ, LAN, WAN).', importance: 'CRITIQUE' },
                  { name: 'IDS/IPS', desc: 'Détection et prévention d\'intrusion. Analyse le trafic en temps réel.', importance: 'HAUTE' },
                  { name: 'Firewall Next-Gen', desc: 'Filtrage applicatif (Layer 7), inspection profonde des paquets (DPI).', importance: 'CRITIQUE' },
                  { name: 'NAC (Network Access Control)', desc: 'Contrôle d\'accès au réseau basé sur l\'identité et la conformité des postes.', importance: 'HAUTE' },
                  { name: 'Monitoring SIEM', desc: 'Corrélation et analyse des logs réseau centralisée.', importance: 'HAUTE' },
                  { name: 'Zero Trust Network', desc: 'Ne jamais faire confiance, toujours vérifier. Micro-segmentation.', importance: 'CRITIQUE' },
                ].map((defense, idx) => (
                  <div key={idx} className="p-3 bg-background rounded border">
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-sm">{defense.name}</div>
                      <Badge variant={defense.importance === 'CRITIQUE' ? 'destructive' : 'default'} className="text-xs">
                        {defense.importance}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{defense.desc}</div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        );

      default:
        return (
          <div className="text-center text-muted-foreground py-4">
            <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Interface de l'outil en développement</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-2/3 sm:w-1/3 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-4/5 sm:w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>

      <div className="relative py-12 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-3 h-3 bg-secondary rounded-full animate-ping"></div>
              <Wrench className="w-10 h-10 text-secondary" />
              <div className="w-3 h-3 bg-accent rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold mb-6">
              <span className="bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">
                Outils Cybersécurité
              </span>
            </h1>

            <div className="relative max-w-3xl mx-auto">
              <p className="text-lg sm:text-xl text-muted-foreground px-4 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                Collection d'outils pour tester et améliorer votre sécurité
              </p>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent"></div>
            </div>
          </div>

          {tools.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Aucun outil disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {tools.map((tool, idx) => (
                <Card
                  key={tool.id}
                  className="cyber-border hover:cyber-glow transition-all duration-500 h-full flex flex-col bg-card/50 backdrop-blur-sm hover:scale-[1.02] group/card animate-fade-in"
                  style={{ animationDelay: `${0.6 + (idx * 0.1)}s`, animationFillMode: 'both' }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(tool.category)}`}>
                        {getCategoryIcon(tool.category)}
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover/card:text-secondary transition-colors">{tool.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          {tool.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                    {renderToolInterface(tool)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tools;
