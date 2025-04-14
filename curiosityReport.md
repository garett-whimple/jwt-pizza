# Terraform: Infrastructure as Code

## Introduction
Terraform was an open-source Infrastructure as Code (IaC) tool (changed in 2023 to be a Business Source License) created by HashiCorp that allows developers to define and provision data center infrastructure using a declarative configuration language. Rather than manually setting up cloud resources through a provider's console or using custom scripts, Terraform enables you to describe your entire infrastructure as code and deploy it consistently across multiple environments.

## Why Terraform Matters in DevOps and Why I Wanted to Learn About it

### Problem Solved
Before Infrastructure as Code tools like Terraform, infrastructure management was often:
- Manual and error-prone
  - There were several times when I thought that I had messed something up and just wanted to delete or remake a resource on aws but I was worried that I would mess something up or that I would forget how I orginally set it up.
- Difficult to version control
- **Hard to replicate across environments**
  - I was thinking about this when working on jwt pizza and realized how useful it would be to be able to create an entire environment when I needed to do testing. In a real world situation this would be extremely valuable.
- **Time-consuming to scale**

Terraform addresses these challenges by treating infrastructure like software - written, versioned, shared, and executed with predictable results.

### Core Benefits
1. **Provider-Agnostic**: Works with AWS, Azure, Google Cloud, and hundreds of other providers
   1. I haven't worked on anything other than AWS but this is a major selling point to me. I originally thought that terraform only worked on aws.
2. **Declarative Syntax**: You specify the desired end state, not the steps to get there
    1. This seems really awesome because that means that if something changes in how I need to set things up it won't really matter because were just giving it an end state.
3. **State Management**: Tracks the current state of your infrastructure
4. **Change Planning**: Preview changes before applying them with `terraform plan`
    1. This was beneficial for me when I was testing it out because when I changed something and went to apply the changes it would tell me what was going to change and then also if I wanted to continue
   2. This is important to me because I was originally really worried that I would accidentally delete a lot of the resources that I created on AWS. (It won't try to delete something unless it is tracking it and it shows you what is about to change)
5. **Modular Design**: Reuse configurations across projects and teams
   1. This seems really powerful if you have a large organization, and you can just reuse a "module" that someone made for a specific type of app

## How Terraform Works

### Key Concepts

#### 1. Configuration Files
Terraform uses HashiCorp Configuration Language (HCL) or JSON to define infrastructure. Most commonly used is HCL due to its readability:

```hcl
resource "aws_instance" "example" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  tags = {
    Name = "example-instance"
  }
}
```

#### 2. Providers
Providers are plugins that allow Terraform to interact with cloud providers, SaaS providers, and other APIs:

```hcl
provider "aws" {
  region = "us-west-2"
}
```

#### 3. Resources
Resources are the infrastructure components you want to create, like virtual machines, networks, or DNS records.

#### 4. State
Terraform maintains a state file that maps real-world resources to your configuration, tracks metadata, and improves performance for large infrastructures.
- From what I understand this is the how terraform knows what it previously created so then when you change the terraform file it will know to delete those resources if they are no longer in the terraform file which is really cool.

#### 5. Modules
Modules are reusable configuration packages that encapsulate resources for specific functions (ex., a front end or back end app).

### The Terraform Workflow

1. **Write** configuration files that define your infrastructure
2. **Initialize** the working directory with `terraform init`
3. **Plan** changes with `terraform plan`
4. **Apply** changes with `terraform apply`
5. **Destroy** infrastructure when no longer needed with `terraform destroy`

### Installation

#### Mac (using Homebrew)
```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```

#### Windows (using Chocolatey)
```bash
choco install terraform
```

### Verify Installation
```bash
terraform -version
```


## Terraform Best Practices

### Code Organization
- Use consistent naming conventions
- Split configurations into multiple files (`main.tf`, `variables.tf`, `outputs.tf`)
  - This would allow you to create all your parameter store variables in a different file than your ec2 instance or things like that so you can stay organized
- Use modules for reusable components

### State Management
- Store state remotely (S3, Azure Blob, etc.) for team collaboration
  - This subject seemed fascinating to me because there are several things that I have done that work great when you are the only one working on them and then once someone else tries to do a similar thing then it will does not work nearly as well.
  - This will cause the terraform to look at a remote source for the state which will make it so the state management works correctly
- Enable state locking to prevent concurrent modifications
  - dynamodb_table = "terraform-locks"
- Consider using workspaces for environment separation

```hcl
terraform {
  backend "s3" {
    bucket = "terraform-state-bucket"
    key    = "project/terraform.tfstate"
    region = "us-west-2"
    dynamodb_table = "terraform-locks" // Stops concurrent changes
    encrypt = true
  }
}
```

### Security Practices
- Never commit credentials to version control
- Use environment variables or credential files for authentication
- Implement least privilege access for Terraform operations
- Regularly audit and rotate credentials

### Version Control Integration
- Commit `.tf` files to git
- But dont commit `.tfstate` files, `.terraform` directories, and credentials

## Conclusion

Terraform has become an essential tool in modern DevOps practices because it addresses key infrastructure challenges:
- Eliminates configuration drift
  - I also liked how you can add to your pipeline to make sure that all the aws resources are created. This means that you might not even run the terraform when you are adding things to aws, but it gets ran when you push to main
- Provides documentation through code
- Enables collaboration through version control
- Ensures consistent environments
- Accelerates provisioning and changes

## Additional Thoughts 

I think that learning Terraform is a super valuable skill that fits into the broader Infrastructure as Code movement. As cloud infrastructure becomes more complex, tools like Terraform that bring software engineering principles to infrastructure management become increasingly important and significant help automate things which is what this class is all about. 

Something that I saw while learning about terraform is that there was a group that created a fork of the Terraform Repo because they were changing their license to be a Business Source License. They did this because they wanted the project to continue to be open source and now their is a software called OpenTofu that you can get that is open source and is already compatible with terraform but it will continue to be open source and from what I read it sounds like they have some additional features that people like. So I may look into using OpenTofu in the future and seeing what they have.

