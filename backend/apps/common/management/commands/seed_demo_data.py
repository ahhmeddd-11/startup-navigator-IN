import os
import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils.text import slugify

from resources.models import ResourceCategory, ResourceTag, Resource
from knowledge.models import KnowledgeCategory, KnowledgeTag, Article

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds the database with realistic demo data for categories, tags, resources, and articles."

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Starting database seeding process..."))

        # 1. Resolve or create demo users
        admins_data = [
            {"email": "admin1@startupnavigator.in", "full_name": "Admin One", "password": "admin12345"},
            {"email": "admin2@startupnavigator.in", "full_name": "Admin Two", "password": "admin12345"},
        ]
        users_data = [
            {"email": "user1@startupnavigator.in", "full_name": "User One", "password": "user12345"},
            {"email": "user2@startupnavigator.in", "full_name": "User Two", "password": "user12345"},
            {"email": "user3@startupnavigator.in", "full_name": "User Three", "password": "user12345"},
        ]

        for adm in admins_data:
            admin_user, created = User.objects.get_or_create(
                email=adm["email"],
                defaults={
                    "full_name": adm["full_name"],
                    "is_staff": True,
                    "is_superuser": True,
                }
            )
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.set_password(adm["password"])
            admin_user.save()
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created admin user '{adm['email']}'."))
            else:
                self.stdout.write(self.style.SUCCESS(f"Enforced admin privileges for existing user '{adm['email']}'."))

        for u in users_data:
            normal_user, created = User.objects.get_or_create(
                email=u["email"],
                defaults={
                    "full_name": u["full_name"],
                    "is_staff": False,
                    "is_superuser": False,
                }
            )
            normal_user.is_staff = False
            normal_user.is_superuser = False
            normal_user.set_password(u["password"])
            normal_user.save()
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created normal user '{u['email']}'."))

        author = User.objects.filter(email="admin1@startupnavigator.in").first()
        if not author:
            author = User.objects.filter(is_superuser=True).first()

        # 2. Seed Resource Categories
        self.stdout.write("Seeding Resource Categories...")
        resource_categories_data = [
            {"name": "Business Planning", "description": "Formulating strategies, business models, and operational plans for early-stage ventures."},
            {"name": "Finance", "description": "Managing capital, bookkeeping, budgeting, and unit economics calculations."},
            {"name": "Fundraising", "description": "Securing seed capital, preparing pitch decks, and managing investor relationships."},
            {"name": "Legal", "description": "Navigating corporate structures, founders agreements, intellectual property, and contracts."},
            {"name": "Product", "description": "Defining roadmap, designing user experience, building MVPs, and validation strategies."},
            {"name": "Marketing", "description": "User acquisition, search engine optimization, content marketing, and brand building."},
            {"name": "Sales", "description": "Setting up pipelines, qualifying leads, outbound outreach, and closing deals."},
            {"name": "HR", "description": "Hiring strategies, equity vesting, ESOP pool setup, and human resource management."},
            {"name": "Operations", "description": "Scaling administrative operations, board meetings, and vendor management."},
            {"name": "Technology", "description": "Tech stack selection, systems architecture, security compliance, and development tools."},
            {"name": "Foundations", "description": "Key concepts and frameworks for understanding startup basics and methodologies."},
            {"name": "Incorporation", "description": "Setting up a private limited company, LLP registration, and basic business entity compliance."},
            {"name": "Funding", "description": "Exploring dilutive and non-dilutive financing options, grants, and venture capital."},
            {"name": "Compliance", "description": "Regulatory compliance, filings, taxation records, and governmental mandates."},
            {"name": "Growth", "description": "Scaling user base, retention metrics, and customer acquisition optimization."},
            {"name": "Hiring", "description": "Attracting talent, structuring job profiles, and building the initial core team."},
            {"name": "Taxation", "description": "Tax structure for startups including GST filings, direct tax compliance, and exemptions."}
        ]

        created_res_categories_count = 0
        skipped_res_categories_count = 0
        resource_category_map = {}

        for cat_data in resource_categories_data:
            cat, created = ResourceCategory.objects.get_or_create(
                name=cat_data["name"],
                defaults={"description": cat_data["description"]}
            )
            resource_category_map[cat.name] = cat
            if created:
                created_res_categories_count += 1
            else:
                skipped_res_categories_count += 1

        self.stdout.write(self.style.SUCCESS(f"Resource Categories: Created {created_res_categories_count}, Skipped {skipped_res_categories_count}."))

        # 3. Seed Knowledge Categories
        self.stdout.write("Seeding Knowledge Categories...")
        created_kn_categories_count = 0
        skipped_kn_categories_count = 0
        knowledge_category_map = {}

        for cat_data in resource_categories_data:
            cat, created = KnowledgeCategory.objects.get_or_create(
                name=cat_data["name"],
                defaults={"description": cat_data["description"]}
            )
            knowledge_category_map[cat.name] = cat
            if created:
                created_kn_categories_count += 1
            else:
                skipped_kn_categories_count += 1

        self.stdout.write(self.style.SUCCESS(f"Knowledge Categories: Created {created_kn_categories_count}, Skipped {skipped_kn_categories_count}."))

        # 4. Seed Resource Tags
        self.stdout.write("Seeding Resource Tags...")
        tags_list = [
            "Startup", "AI", "SaaS", "FinTech", "EdTech", "HealthTech", "DeepTech", "MVP", 
            "Pitch Deck", "Finance", "Legal", "Marketing", "Sales", "Investment", "Growth", 
            "DPIIT", "Startup India", "Compliance", "SISFS", "Seed", "Grants", "GST", "Team", 
            "ESOPs", "PMF", "Product", "Pre-seed", "Fundraising", "Metrics", "Unit economics", "ROC"
        ]

        created_res_tags_count = 0
        skipped_res_tags_count = 0
        resource_tag_map = {}

        for tag_name in tags_list:
            tag, created = ResourceTag.objects.get_or_create(name=tag_name)
            resource_tag_map[tag.name] = tag
            if created:
                created_res_tags_count += 1
            else:
                skipped_res_tags_count += 1

        self.stdout.write(self.style.SUCCESS(f"Resource Tags: Created {created_res_tags_count}, Skipped {skipped_res_tags_count}."))

        # 5. Seed Knowledge Tags
        self.stdout.write("Seeding Knowledge Tags...")
        created_kn_tags_count = 0
        skipped_kn_tags_count = 0
        knowledge_tag_map = {}

        for tag_name in tags_list:
            tag, created = KnowledgeTag.objects.get_or_create(name=tag_name)
            knowledge_tag_map[tag.name] = tag
            if created:
                created_kn_tags_count += 1
            else:
                skipped_kn_tags_count += 1

        self.stdout.write(self.style.SUCCESS(f"Knowledge Tags: Created {created_kn_tags_count}, Skipped {skipped_kn_tags_count}."))

        # 6. Seed Resources (25–30 entries)
        self.stdout.write("Seeding Resources...")
        resources_data = [
            {
                "title": "Founder Pitch Deck (Seed Edition)",
                "resource_type": "Template",
                "short_description": "The 12-slide deck we've seen close over ₹400Cr in seed rounds — with detailed speaker notes.",
                "full_description": "A comprehensive presentation template designed for early-stage startups seeking seed funding. Includes slides for Problem statement, Solution, Market opportunity, Business model, Go-to-market strategy, Competitor analysis, Financial projections, Team, and Fund requirements.",
                "category": "Fundraising",
                "duration": "30 min",
                "slug": "founder-pitch-deck",
                "external_link": "https://seedfund.startupindia.gov.in/",
                "tags": ["Pitch Deck", "Fundraising", "Investment", "Seed"]
            },
            {
                "title": "ESOP Planning Toolkit",
                "resource_type": "Toolkit",
                "short_description": "Cap-table model, vesting schedules, and communication templates for a fair, motivating ESOP program.",
                "full_description": "An essential toolkit for founders looking to implement an Employee Stock Option Plan. Includes structured spreadsheets to model equity dilution, standard vesting templates with a 1-year cliff, and guidelines to communicate ESOP benefits to prospective hires.",
                "category": "HR",
                "duration": "45 min",
                "slug": "esop-planning-toolkit",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["ESOPs", "Team", "Legal", "Startup"]
            },
            {
                "title": "Pvt Ltd Incorporation Checklist",
                "resource_type": "Checklist",
                "short_description": "Everything from DSC to PAN, TAN, MSME and Startup India recognition — sequenced correctly.",
                "full_description": "A step-by-step checklist to guide founders through the process of registering a Private Limited Company in India. Outlines how to acquire Digital Signature Certificates (DSC), register company names with MCA, obtain PAN and TAN numbers, register under Udyam MSME, and achieve DPIIT recognition.",
                "category": "Incorporation",
                "duration": "20 min",
                "slug": "incorporation-checklist",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Compliance", "Legal", "DPIIT", "Startup India"]
            },
            {
                "title": "Founders' Agreement Template",
                "resource_type": "Template",
                "short_description": "Equity vesting, IP assignment, decision rights, and exit terms — reviewed by Indian corporate counsel.",
                "full_description": "A robust legal template for co-founders to govern their relationship and outline corporate governance rules. Covers initial equity splits, vesting conditions, roles and responsibilities, IP assignment clauses, dispute resolution protocols, and exit parameters.",
                "category": "Foundations",
                "duration": "40 min",
                "slug": "founding-team-agreement",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Legal", "Startup", "Finance"]
            },
            {
                "title": "Getting to Your First 100 Customers",
                "resource_type": "Guide",
                "short_description": "Channel-by-channel playbook for B2B, B2C, and marketplace startups in the Indian context.",
                "full_description": "A highly practical guide outlining marketing strategies to acquire your first 100 paying customers. Analyzes cold outbound methods, SEO content generation, platform partnerships, and referral engines tailored for the Indian business ecosystem.",
                "category": "Growth",
                "duration": "60 min",
                "slug": "gtm-first-hundred-customers",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Growth", "Marketing", "Sales", "SaaS"]
            },
            {
                "title": "Annual Compliance Calendar",
                "resource_type": "Checklist",
                "short_description": "Every ROC, tax, and labour filing your startup must complete this year, with due dates and owners.",
                "full_description": "A compliance tracker to ensure your company meets all statutory filing timelines set by ROC, Income Tax department, and labor ministries. Helps track TDS payments, GST filings, annual returns, and audit schedules.",
                "category": "Compliance",
                "duration": "15 min",
                "slug": "annual-compliance-calendar",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Compliance", "Legal", "ROC"]
            },
            {
                "title": "Financial Model Template (SaaS & B2B)",
                "resource_type": "Template",
                "short_description": "A clean 3-year forecasting model covering revenue projections, hiring plan, and cash burn rate.",
                "full_description": "A flexible financial model template for SaaS and subscription business models. Helps you project monthly recurring revenue (MRR), customer acquisition costs, staff expenses, and net cash flows to evaluate runway.",
                "category": "Finance",
                "duration": "45 min",
                "slug": "financial-model-template",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Finance", "Metrics", "SaaS", "Investment"]
            },
            {
                "title": "Business Model Canvas",
                "resource_type": "Template",
                "short_description": "A one-page strategic management tool used for developing new or documenting existing business models.",
                "full_description": "A clean canvas layout to quickly map out the nine core building blocks of a business: customer segments, value propositions, channels, customer relationships, revenue streams, key resources, key activities, key partners, and cost structure.",
                "category": "Business Planning",
                "duration": "15 min",
                "slug": "business-model-canvas",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Startup", "MVP", "Product"]
            },
            {
                "title": "Go-To-Market (GTM) Checklist",
                "resource_type": "Checklist",
                "short_description": "A step-by-step roadmap to validate your value proposition, configure pricing, and scale distribution.",
                "full_description": "A checklist helping startup product teams align product release milestones with marketing channels. Guides you through landing page preparation, beta testing cycles, customer support setups, and marketing campaigns.",
                "category": "Growth",
                "duration": "25 min",
                "slug": "go-to-market-checklist",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Growth", "Marketing", "Product"]
            },
            {
                "title": "Investor Outreach Tracker",
                "resource_type": "Toolkit",
                "short_description": "A structured CRM database to manage warm introductions, investor profiles, interest levels, and follow-ups.",
                "full_description": "A workflow dashboard template to keep track of conversations with angel investors and venture capital firms. Categorizes prospects by target check sizes, current status, key discussion notes, and scheduled follow-up actions.",
                "category": "Fundraising",
                "duration": "20 min",
                "slug": "investor-outreach-tracker",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Fundraising", "Investment", "Pitch Deck"]
            },
            {
                "title": "Customer Interview Template",
                "resource_type": "Template",
                "short_description": "Question list and script designed to test startup hypotheses without leading the witness.",
                "full_description": "A customer validation script based on user research best practices. Helps founders run discovery interviews to extract honest user behaviors, actual frustrations, and their willingness to pay for a solution.",
                "category": "Product",
                "duration": "15 min",
                "slug": "customer-interview-template",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Product", "PMF", "Startup"]
            },
            {
                "title": "Startup Budget Spreadsheet",
                "resource_type": "Template",
                "short_description": "A detailed spreadsheet for monitoring runway, monthly recurring costs, capital expenditure, and vendor budgets.",
                "full_description": "A simple budget management template allowing founders to record operations expenditure (OpEx), payroll, software subscriptions, and hardware purchases. Helps calculate burn rate and project runway.",
                "category": "Finance",
                "duration": "30 min",
                "slug": "startup-budget-spreadsheet",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Finance", "Metrics", "Compliance"]
            },
            {
                "title": "NDA (Non-Disclosure Agreement) Template",
                "resource_type": "Template",
                "short_description": "A mutual non-disclosure agreement to protect trade secrets and intellectual property during early discussions.",
                "full_description": "A standard mutual NDA document drafted by legal professionals to secure confidential business concepts, codebases, and financial metrics before sharing information with external parties.",
                "category": "Legal",
                "duration": "10 min",
                "slug": "nda-template",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Legal", "Compliance"]
            },
            {
                "title": "Hiring Checklist",
                "resource_type": "Checklist",
                "short_description": "From drafting job descriptions to running background checks and executing onboarding workflows.",
                "full_description": "A recruitment playbook detailing how to coordinate candidate pipelines, conduct structured technical/culture fit interviews, check professional references, and establish digital onboarding steps.",
                "category": "HR",
                "duration": "15 min",
                "slug": "hiring-checklist",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Team", "Hiring", "HR"]
            },
            {
                "title": "Product Roadmap Template",
                "resource_type": "Template",
                "short_description": "Visual layout to map product milestones, feature requests, sprint timelines, and resource distribution.",
                "full_description": "A roadmap builder template structured as a Kanban board. Enables product managers to categorize deliverables by 'Now', 'Next', and 'Later' stages, aligning engineering efforts with overall strategy.",
                "category": "Product",
                "duration": "30 min",
                "slug": "product-roadmap-template",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Product", "MVP", "SaaS"]
            },
            {
                "title": "SWOT Analysis Template",
                "resource_type": "Template",
                "short_description": "Identify your startup's internal strengths and weaknesses, alongside external opportunities and threats.",
                "full_description": "A clean framework layout with questionnaires designed to help founders identify unique competitive advantages, organizational weaknesses, growth opportunities, and critical industry risks.",
                "category": "Business Planning",
                "duration": "15 min",
                "slug": "swot-analysis-template",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Startup", "Business Planning"]
            },
            {
                "title": "Competitor Analysis Sheet",
                "resource_type": "Template",
                "short_description": "Map competitor features, pricing, strengths, weaknesses, and unique selling propositions.",
                "full_description": "An interactive database template designed to gather competitor intelligence. Helps analyze competitor pricing models, product feature sets, search engine keywords, and customer acquisition strategies.",
                "category": "Business Planning",
                "duration": "25 min",
                "slug": "competitor-analysis-sheet",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Marketing", "Sales", "Business Planning"]
            },
            {
                "title": "OKR Planner",
                "resource_type": "Toolkit",
                "short_description": "Align company goals with team key results. Tracks execution, ownership, and weekly check-in scores.",
                "full_description": "A tracking spreadsheet implementing the Objectives and Key Results framework. Helps founders align organization-wide objectives with actionable, quantifiable targets for dev, marketing, and sales departments.",
                "category": "Operations",
                "duration": "35 min",
                "slug": "okr-planner",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Team", "Compliance", "Operations"]
            },
            {
                "title": "Unit Economics Calculator",
                "resource_type": "Toolkit",
                "short_description": "Formulas to calculate Customer Acquisition Cost (CAC), Lifetime Value (LTV), Payback Period, and contribution margins.",
                "full_description": "An analytical spreadsheet containing pre-built equations to audit business profitability. Analyzes blended vs. paid CAC, monthly user churn rate, LTV-to-CAC ratios, and customer payback windows.",
                "category": "Finance",
                "duration": "20 min",
                "slug": "unit-economics-calculator",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Finance", "Metrics", "Unit economics"]
            },
            {
                "title": "Market Research Template",
                "resource_type": "Template",
                "short_description": "Guides your team through calculating Total Addressable Market (TAM), SAM, and SOM using top-down and bottom-up models.",
                "full_description": "A structured document template assisting startups in sizing their industry opportunities. Outlines how to execute top-down calculations using industry reports and bottom-up sizing based on target customer volume and pricing.",
                "category": "Business Planning",
                "duration": "40 min",
                "slug": "market-research-template",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Startup", "Marketing", "Business Planning"]
            },
            {
                "title": "Sales Pipeline Tracker",
                "resource_type": "Template",
                "short_description": "CRM model to track B2B sales leads from prospect stage to qualification, proposal, negotiation, and closed won/lost.",
                "full_description": "A deal tracking database. Helps founders log inbound and outbound leads, monitor conversions across stages, track individual contract values, and forecast upcoming monthly revenues.",
                "category": "Sales",
                "duration": "20 min",
                "slug": "sales-pipeline-tracker",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Sales", "Growth", "Marketing"]
            },
            {
                "title": "Pricing Calculator",
                "resource_type": "Toolkit",
                "short_description": "Interactive sheet to evaluate cost-plus, value-based, and competitor-relative pricing strategies for SaaS and physical products.",
                "full_description": "An interactive calculator to model price elasticity, customer conversion effects, and total margins across varying subscription tiers, seat-based licenses, and transaction charges.",
                "category": "Finance",
                "duration": "25 min",
                "slug": "pricing-calculator",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Finance", "Product", "Metrics"]
            },
            {
                "title": "Customer Persona Worksheet",
                "resource_type": "Template",
                "short_description": "Deep dive into user demographics, behavior patterns, motivations, goals, and core pain points.",
                "full_description": "A graphic worksheet layout designed to create fictional profiles of target customers. Guides product managers in logging core needs, workflow frustrations, favorite digital platforms, and buying triggers.",
                "category": "Product",
                "duration": "15 min",
                "slug": "customer-persona-worksheet",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Product", "Marketing", "PMF"]
            },
            {
                "title": "Product Launch Checklist",
                "resource_type": "Checklist",
                "short_description": "Comprehensive launch calendar covering dev freeze, marketing assets, PR outreach, analytics setup, and support readiness.",
                "full_description": "A cross-functional launch checklist. Keeps product, engineering, and growth teams aligned throughout launch week. Covers server load testing, analytics tracking code validation, customer feedback loop testing, and social media posting schedules.",
                "category": "Product",
                "duration": "30 min",
                "slug": "product-launch-checklist",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Product", "Growth", "Marketing"]
            },
            {
                "title": "Pitch Deck Guide: Design and Narrative",
                "resource_type": "Guide",
                "short_description": "An in-depth guide on formatting, graphic choices, slide sequences, and crafting compelling startup stories.",
                "full_description": "A design manual providing recommendations on slide visual hierarchy, typography selections, slide layouts, and writing compelling investment hooks for your fundraising decks.",
                "category": "Fundraising",
                "duration": "30 min",
                "slug": "pitch-deck-guide",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Pitch Deck", "Fundraising", "Investment"]
            },
            {
                "title": "Seed Funding Readiness Checklist",
                "resource_type": "Checklist",
                "short_description": "Assess if your traction, legal status, and pitch assets are prepared for institutional angel networks and seed VCs.",
                "full_description": "An audit checklist evaluating startup traction metrics, annual run rates, core customer retention numbers, intellectual property ownership agreements, and team alignments to ensure readiness for institutional seed funding rounds.",
                "category": "Fundraising",
                "duration": "20 min",
                "slug": "seed-funding-readiness",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Fundraising", "Investment", "Pre-seed"]
            },
            {
                "title": "Pre-Seed Checklist",
                "resource_type": "Checklist",
                "short_description": "Perfect for founders transitioning from ideation to launching a minimum viable product and raising initial angel rounds.",
                "full_description": "A checklist assisting pre-seed founders in building landing pages, recruiting early co-founders, drafting founders agreements, establishing legal structures, and raising primary angel capital.",
                "category": "Fundraising",
                "duration": "15 min",
                "slug": "pre-seed-checklist",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["Fundraising", "Investment", "Startup"]
            },
            {
                "title": "GST Registration Guide & Checklist",
                "resource_type": "Guide",
                "short_description": "Step-by-step process of applying for GST registration in India, required documents, and critical registration exemptions.",
                "full_description": "An educational guide explaining the Goods and Services Tax registration requirements. Outlines necessary documents like company PAN, director identities, proof of business address, and details monthly and quarterly filing obligations.",
                "category": "Taxation",
                "duration": "20 min",
                "slug": "gst-registration-guide",
                "external_link": "https://www.startupindia.gov.in/",
                "tags": ["GST", "Taxation", "Compliance"]
            },
            # Seed Government Schemes as Resources/Articles under appropriate categories since no Scheme model exists
            {
                "title": "Startup India Seed Fund Scheme (SISFS)",
                "resource_type": "Guide",
                "short_description": "Financial assistance of up to ₹50 Lakh for proof of concept, prototype trials, and market entry.",
                "full_description": "Detailed guidelines on how to apply for the Startup India Seed Fund. Explains eligibility requirements for DPIIT-recognized startups, the evaluation criteria used by incubators, and the difference between proof-of-concept grants (up to ₹20L) and commercialization debt/equity (up to ₹50L).",
                "category": "Funding",
                "duration": "25 min",
                "slug": "startup-india-seed-fund-guide",
                "external_link": "https://seedfund.startupindia.gov.in",
                "tags": ["Startup India", "SISFS", "Grants", "Seed"]
            },
            {
                "title": "Atal Innovation Mission (AIM)",
                "resource_type": "Guide",
                "short_description": "Central initiative offering incubation space, grants of up to ₹10 Crore, and global mentor networks.",
                "full_description": "A guide on leveraging NITI Aayog's flagship Atal Innovation Mission. Outlines how early-stage tech innovators can gain access to Atal Incubation Centres, apply for innovation grants, and connect with global technical mentors.",
                "category": "Technology",
                "duration": "30 min",
                "slug": "atal-innovation-mission-guide",
                "external_link": "https://aim.gov.in",
                "tags": ["Grants", "DeepTech", "Startup India", "Startup"]
            }
        ]

        created_resources_count = 0
        skipped_resources_count = 0

        for res_data in resources_data:
            cat_obj = resource_category_map.get(res_data["category"])
            if not cat_obj:
                # Fallback to the first category if not found
                cat_obj = list(resource_category_map.values())[0]

            res, created = Resource.objects.get_or_create(
                slug=res_data["slug"],
                defaults={
                    "title": res_data["title"],
                    "resource_type": res_data["resource_type"],
                    "short_description": res_data["short_description"],
                    "full_description": res_data["full_description"],
                    "duration": res_data["duration"],
                    "external_link": res_data["external_link"],
                    "category": cat_obj,
                    "is_published": True,
                    "created_by": author,
                    "featured": random.choice([True, False])
                }
            )

            # Set tags
            if created or res.tags.count() == 0:
                tag_objs = [resource_tag_map[t] for t in res_data["tags"] if t in resource_tag_map]
                res.tags.set(tag_objs)

            if created:
                created_resources_count += 1
            else:
                skipped_resources_count += 1

        self.stdout.write(self.style.SUCCESS(f"Resources: Created {created_resources_count}, Skipped {skipped_resources_count}."))

        # 7. Seed Articles (20–25 entries)
        self.stdout.write("Seeding Articles...")
        articles_data = [
            {
                "title": "DPIIT Recognition, explained end-to-end",
                "summary": "A practical walkthrough of the DPIIT startup recognition process — eligibility, documents, and what changes once you're recognised.",
                "content": "DPIIT recognition is the gateway to most Startup India benefits — tax exemptions, self-certification for labour laws, and access to funding programs. For a young company, getting this right early avoids months of paperwork later.\n\nEligibility is straightforward: your entity must be a Private Limited Company, LLP, or Registered Partnership, incorporated within the last 10 years, with turnover under ₹100 crore in any financial year since incorporation.\n\nThe recognition application is filed on the Startup India portal. You'll need your Certificate of Incorporation, a short pitch or product description, and details of directors and founders. Approval typically takes 5–7 working days.\n\nOnce recognised, you unlock Section 80-IAC income tax exemption (subject to IMB approval), angel tax exemption under Section 56, faster patent examination, and eligibility for the Fund of Funds for Startups.",
                "reading_time": 9,
                "category": "Incorporation",
                "tags": ["DPIIT", "Startup India", "Compliance"],
                "slug": "dpiit-recognition-explained"
            },
            {
                "title": "Startup India Seed Fund Scheme: a founder's guide",
                "summary": "SISFS provides up to ₹50 lakh in grants and debt. Here's how to structure your application and pick the right incubator.",
                "content": "SISFS is disbursed through DPIIT-approved incubators. Up to ₹20 lakh as a grant for proof-of-concept and up to ₹50 lakh as convertible debt for market entry, commercialisation, or scale-up.\n\nThe scheme prioritises startups solving real problems with a functional prototype. Your application should demonstrate technical readiness, a clear go-to-market, and coachability.\n\nPick incubators aligned with your sector. IIM Bangalore's NSRCEL, IIT Madras Incubation Cell, and T-Hub Hyderabad each have distinct thesis areas.\n\nThe pitch is 12 minutes with 8 minutes of Q&A. Lead with the problem, show traction proof, and be explicit about how you'll deploy the capital across 12–18 months.",
                "reading_time": 12,
                "category": "Funding",
                "tags": ["SISFS", "Seed", "Grants"],
                "slug": "seed-fund-scheme-guide"
            },
            {
                "title": "GST basics every early-stage founder should know",
                "summary": "Registration thresholds, invoicing rules, and the compliance calendar that will keep you out of trouble.",
                "content": "GST registration is mandatory once your aggregate turnover crosses ₹20 lakh (₹10 lakh in special states) or if you sell across states, on marketplaces, or provide certain notified services.\n\nEvery tax invoice must carry your GSTIN, place of supply, HSN/SAC code, and the applicable CGST/SGST or IGST breakdown. Automate this early — spreadsheets don't scale past a few dozen invoices.\n\nGSTR-1 is due monthly on the 11th (or quarterly under QRMP), GSTR-3B on the 20th. Late filing attracts interest at 18% p.a. plus late fees.",
                "reading_time": 7,
                "category": "Taxation",
                "tags": ["GST", "Compliance"],
                "slug": "gst-basics-for-founders"
            },
            {
                "title": "Hiring your first ten: playbook for founders",
                "summary": "Structuring roles, negotiating equity, and running interview loops that actually predict performance.",
                "content": "Your first ten hires define culture. Resist the urge to hire senior generalists — early-stage teams win with owners who ship, not managers who plan.\n\nTypical seed-stage ESOP pool is 10–15%. Reserve 1.0–2.5% for a first engineer, 0.5–1.5% for early product/design, and 0.1–0.5% for functional specialists.\n\nRun structured loops: a work-sample task, a technical deep-dive, a values conversation, and a founder alignment call. Rate on evidence, not vibes.",
                "reading_time": 11,
                "category": "Hiring",
                "tags": ["Team", "ESOPs"],
                "slug": "hiring-your-first-ten"
            },
            {
                "title": "Reading real product-market fit signals",
                "summary": "Beyond retention curves — the qualitative signals that tell you before the metrics do.",
                "content": "PMF isn't a number. It's the moment users start pulling your product from you — asking for access, referring peers unprompted, working around missing features.\n\nThe clearest leading signal is unforced usage growth from a single wedge segment. If growth needs constant sales effort, you're still searching.",
                "reading_time": 8,
                "category": "Product",
                "tags": ["PMF", "Product"],
                "slug": "product-market-fit-signals"
            },
            {
                "title": "Raising your pre-seed in India: 2026 edition",
                "summary": "Investor landscape, realistic valuations, and how to run a two-week close.",
                "content": "The Indian pre-seed market has matured. Dedicated funds like Better Capital, All In Capital, and Neon Fund now write conviction-first cheques from ₹50L to ₹3Cr.\n\nFair pre-seed valuations sit between ₹8–25Cr post-money depending on team pedigree, early traction, and sector tailwinds. Avoid anchoring on the outliers you read about.\n\nRun a compressed process. Warm intros in week one, first meetings in week two, term sheets by week three. Momentum closes rounds.",
                "reading_time": 10,
                "category": "Funding",
                "tags": ["Pre-seed", "Fundraising"],
                "slug": "raising-your-pre-seed"
            },
            {
                "title": "Unit economics that scale, not just spreadsheets that model",
                "summary": "How to build a P&L narrative investors and operators both believe.",
                "content": "Blended CAC hides the truth. Split paid, organic, and referral, then track payback by cohort. Investors will do this in the DD anyway — do it first.\n\nUnder 12-month payback earns you the right to spend. Over 18 months and you're funding growth from equity, not from customers.",
                "reading_time": 9,
                "category": "Growth",
                "tags": ["Metrics", "Unit economics"],
                "slug": "unit-economics-that-scale"
            },
            {
                "title": "The 2026 startup compliance calendar",
                "summary": "ROC, GST, TDS, PT and ESIC — the recurring filings you cannot miss.",
                "content": "Monthly: GSTR-1 (11th), GSTR-3B (20th), TDS payment (7th), PF/ESIC (15th). Automate reminders — penalties compound fast.\n\nAnnual: AOC-4 and MGT-7 for ROC, ITR-6 for the company, DIR-3 KYC for directors, and Form 11 for LLPs.",
                "reading_time": 6,
                "category": "Compliance",
                "tags": ["ROC", "Compliance"],
                "slug": "compliance-calendar-2026"
            },
            {
                "title": "Idea Validation: How to know if your startup concept is viable",
                "summary": "Practical techniques to validate your business idea with minimal time and capital before writing code.",
                "content": "Too many founders build first and talk to users later. Idea validation reverses this. Start by listing your core assumptions about the customer, the problem, and their willingness to pay.\n\nConduct interviews, set up landing pages with email capture, or launch a dry-run service. If you can't get 10 people to give you their email or pay a deposit for your solution, it's time to iterate the idea before building.",
                "reading_time": 8,
                "category": "Foundations",
                "tags": ["Startup", "MVP", "Product"],
                "slug": "idea-validation-guide"
            },
            {
                "title": "The Lean Startup Methodology: Build, Measure, Learn",
                "summary": "A guide to the core principles of lean development, validated learning, and rapid pivoting.",
                "content": "The Lean Startup method challenges the traditional 40-page business plan. Instead of planning in a vacuum, start with a Minimum Viable Product (MVP) to get feedback as fast as possible.\n\nUse build-measure-learn loops to continuously adapt your product. Metrics should measure actual value and customer engagement, rather than vanity metrics like page views or social media likes.",
                "reading_time": 10,
                "category": "Foundations",
                "tags": ["Startup", "MVP", "Growth"],
                "slug": "lean-startup-framework"
            },
            {
                "title": "Mastering Customer Discovery: Ask the Right Questions",
                "summary": "How to talk to prospective customers without biasing their answers, based on the Mom Test principles.",
                "content": "Customer discovery fails when you ask leading questions like 'Would you buy a product that does X?' People are polite and will say yes.\n\nInstead, ask about past behavior: 'How do you currently solve this problem?' or 'When was the last time you ran into this?' Let them show you their actual workflows, paint points, and tools they already pay for.",
                "reading_time": 7,
                "category": "Foundations",
                "tags": ["Product", "Startup", "PMF"],
                "slug": "customer-discovery-tips"
            },
            {
                "title": "Bootstrapping vs. Fundraising: Choosing the right path",
                "summary": "Evaluate when to self-fund your startup versus when to seek institutional venture capital.",
                "content": "Fundraising is not a milestone of success; it is a mechanism of growth that comes with high expectations of equity dilution and rapid scale.\n\nBootstrapping forces you to focus on profitability and customer satisfaction from day one. Choose venture capital if your market has strong network effects and you need to capture market share rapidly; choose bootstrapping if you want full control and sustainable growth.",
                "reading_time": 9,
                "category": "Fundraising",
                "tags": ["Fundraising", "Pre-seed", "Investment"],
                "slug": "bootstrapping-vs-vc"
            },
            {
                "title": "Legal Basics for Indian Startups: Co-founders, Equity, and IP",
                "summary": "Important legal considerations when setting up your business, protecting intellectual property, and distributing equity.",
                "content": "In the excitement of starting up, legal matters are often ignored. A lack of a founder's agreement is a top reason why early-stage startups fail.\n\nDraft a clear founders' agreement outlining equity division, vesting schedules, decision-making rights, and intellectual property assignment. Ensure all work done for the company is formally assigned to the corporate entity.",
                "reading_time": 11,
                "category": "Legal",
                "tags": ["Legal", "Team", "Compliance"],
                "slug": "legal-basics-startups"
            },
            {
                "title": "Content Marketing for Startups: Building organic demand",
                "summary": "A guide to building a content engine that drives high-quality organic traffic and builds trust with your audience.",
                "content": "Paid ads are expensive and transient. Content marketing is an investment that compounds over time. Focus on writing deep, educational articles that address the actual problems your target audience faces.\n\nDistribute your content where your users hang out (Reddit, Twitter, LinkedIn, newsletters) and optimize for search engines by building topical authority.",
                "reading_time": 8,
                "category": "Marketing",
                "tags": ["Marketing", "Growth", "SaaS"],
                "slug": "content-marketing-engine"
            },
            {
                "title": "Inside the Sales Engine: Setting up outbound sales in B2B",
                "summary": "How to build a scalable B2B sales process from cold outreach to closing contracts.",
                "content": "B2B sales require structure. Define your Ideal Customer Profile (ICP), build a clean outbound list, and design a multi-step email and LinkedIn cadence.\n\nFocus on solving, not selling. Use discovery calls to understand the prospect's needs and follow up with tailored demos that directly demonstrate ROI.",
                "reading_time": 9,
                "category": "Sales",
                "tags": ["Sales", "SaaS", "Growth"],
                "slug": "b2b-outbound-sales"
            },
            {
                "title": "Scaling from 10 to 50: Structuring operations and management",
                "summary": "Transitioning from flat organization structures to introducing middle management and formal processes.",
                "content": "What got you to 10 employees won't get you to 50. Communication channels expand exponentially. You need to transition from founder-centric decisions to structured delegation.\n\nIntroduce clear team boundaries, regular syncs, and documented processes. Focus on alignment through company-wide OKRs while giving team leads autonomy to execute.",
                "reading_time": 10,
                "category": "Operations",
                "tags": ["Compliance", "Team", "Startup"],
                "slug": "scaling-operations-guide"
            },
            {
                "title": "SaaS Pricing Strategies: Finding the sweet spot",
                "summary": "How to value and price your SaaS product to maximize revenue and attract customers.",
                "content": "Pricing is a powerful lever for growth. Avoid cost-plus pricing. Instead, focus on value-based pricing: how much value do you generate or cost do you save for the client?\n\nExperiment with pricing tiers, usage-based models, and clear add-ons. Continually iterate your pricing as you add new features and enter new market segments.",
                "reading_time": 8,
                "category": "Product",
                "tags": ["SaaS", "Product", "Finance"],
                "slug": "saas-pricing-strategies"
            },
            {
                "title": "Brand Building on a Budget: Storytelling for early-stage teams",
                "summary": "Crafting a compelling brand narrative and landing your story without a massive PR budget.",
                "content": "Your brand is not your logo; it is the emotional connection customers have with your company. Early-stage startups build brands through clear positioning and authentic storytelling.\n\nShare your founder journey, your customer success stories, and your unique perspective on the industry. Leverage micro-influencers and organic community building.",
                "reading_time": 7,
                "category": "Marketing",
                "tags": ["Marketing", "Growth", "Startup"],
                "slug": "brand-building-budget"
            },
            {
                "title": "Growth Metrics that Matter: LTV, CAC, and Retention",
                "summary": "Understanding the key growth numbers to ensure your business remains sustainable and investable.",
                "content": "Not all growth is good growth. If you are acquiring users at a high cost who churn after one month, your business model is broken.\n\nMeasure customer lifetime value (LTV) and customer acquisition cost (CAC). Keep your LTV to CAC ratio above 3x. More importantly, track retention cohorts to ensure your product has a stable baseline of active users.",
                "reading_time": 9,
                "category": "Growth",
                "tags": ["Metrics", "Growth", "Finance"],
                "slug": "growth-metrics-fundamentals"
            },
            {
                "title": "Understanding Angel Tax & Section 56 of Income Tax Act",
                "summary": "A guide to the legal provisions, tax rates, and exemptions available to recognized startups under Indian tax laws.",
                "content": "Angel Tax refers to the income tax levied on funding received by unlisted companies through the issue of shares that exceed the fair market value of those shares.\n\nUnder Section 56(2)(viib), DPIIT-recognized startups are eligible for exemption from this tax, provided they fulfill certain conditions regarding capital investment and asset purchase. Get your recognition early to secure this crucial relief.",
                "reading_time": 8,
                "category": "Taxation",
                "tags": ["Taxation", "Startup India", "Compliance"],
                "slug": "angel-tax-section-56"
            },
            {
                "title": "Preparing for Due Diligence: A Checklist for Series A",
                "summary": "Ensure your records, financials, and legal documentation are audit-ready for venture capital firms.",
                "content": "Venture capital due diligence can make or break a funding round. Investors will audit your capitalization table, corporate registers, banking records, IP assignment deeds, and customer contracts.\n\nStart organizing a virtual data room (VDR) early. Keep all corporate filings up to date and resolve any pending litigation or regulatory discrepancies immediately.",
                "reading_time": 12,
                "category": "Fundraising",
                "tags": ["Fundraising", "Compliance", "Legal"],
                "slug": "series-a-due-diligence"
            },
            {
                "title": "Safeguarding Intellectual Property: Trademarks and Patents",
                "summary": "A practical guide to registering intellectual property assets for Indian tech startups.",
                "content": "Your code, branding, and algorithms are your most valuable assets. Trademark your brand name and logo early to prevent competitors from piggybacking on your reputation.\n\nIf you have a novel, non-obvious technology, consider filing a patent. Understand the cost and time involved in patent prosecution and leverage the 80% rebate on patent filings offered to DPIIT-recognized startups.",
                "reading_time": 10,
                "category": "Legal",
                "tags": ["Legal", "DPIIT", "Compliance"],
                "slug": "intellectual-property-guide"
            },
            {
                "title": "Remote Work Culture: Managing a distributed startup team",
                "summary": "Tools, workflows, and culture strategies to build a highly productive remote-first engineering and design team.",
                "content": "Remote work offers access to global talent but requires asynchronous communication frameworks. Move from clock-based tracking to outcome-based performance metrics.\n\nDocument everything. Use tools like Notion, Slack, and Loom to maintain alignment, and organize quarterly in-person team retreats to foster stronger interpersonal relationships.",
                "reading_time": 9,
                "category": "HR",
                "tags": ["Team", "Startup", "HR"],
                "slug": "remote-work-culture"
            },
            {
                "title": "Equity Vesting and ESOPs: Aligning incentives for long-term growth",
                "summary": "Designing an Employee Stock Option Plan with vesting schedules, cliffs, and strike prices.",
                "content": "Equity is a finite resource. A standard vesting schedule spans 4 years with a 1-year cliff, meaning an employee must stay for a year before receiving any shares.\n\nConfigure an ESOP pool of 10-15% at your seed stage. Use options as a recruiting tool to attract high-quality leadership who are willing to take lower cash compensation in exchange for equity upside.",
                "reading_time": 10,
                "category": "HR",
                "tags": ["ESOPs", "Team", "HR"],
                "slug": "equity-vesting-esops"
            },
            {
                "title": "Understanding MSME Registration & Benefits (Udyam)",
                "summary": "How registering under MSME (Udyam) unlocks government subsidies, lending benefits, and legal protection.",
                "content": "MSME registration is free, fully online, and paperless. By registering under the Udyam portal, your startup gains access to collateral-free loans, priority sector lending, exemption from direct taxes, and concessions on patent and trademark filings.\n\nAdditionally, MSME registration provides protection against delayed payments, forcing buyers to pay interest if payments are delayed beyond 45 days.",
                "reading_time": 8,
                "category": "Incorporation",
                "tags": ["Startup India", "Grants", "Compliance"],
                "slug": "msme-udyam-benefits"
            }
        ]

        created_articles_count = 0
        skipped_articles_count = 0

        for art_data in articles_data:
            cat_obj = knowledge_category_map.get(art_data["category"])
            if not cat_obj:
                # Fallback to the first category if not found
                cat_obj = list(knowledge_category_map.values())[0]

            # Generate SEO Meta titles and descriptions
            meta_title = art_data["title"][:70]
            meta_desc = art_data["summary"][:160]

            art, created = Article.objects.get_or_create(
                slug=art_data["slug"],
                defaults={
                    "title": art_data["title"],
                    "summary": art_data["summary"],
                    "content": art_data["content"],
                    "reading_time": art_data["reading_time"],
                    "category": cat_obj,
                    "is_published": True,
                    "author": author,
                    "meta_title": meta_title,
                    "meta_description": meta_desc,
                    "featured": random.choice([True, False])
                }
            )

            # Set tags
            if created or art.tags.count() == 0:
                tag_objs = [knowledge_tag_map[t] for t in art_data["tags"] if t in knowledge_tag_map]
                art.tags.set(tag_objs)

            if created:
                created_articles_count += 1
            else:
                skipped_articles_count += 1

        self.stdout.write(self.style.SUCCESS(f"Articles: Created {created_articles_count}, Skipped {skipped_articles_count}."))

        # 8. Success Output Summary
        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully! All existing user-facing models populated."))
