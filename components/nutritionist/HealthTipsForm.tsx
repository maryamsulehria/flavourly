"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Lightbulb, Plus, Save } from "lucide-react";
import { useState } from "react";
import { DetailedRecipe } from "./RecipeVerificationForm";

interface HealthTipsFormProps {
  recipe: DetailedRecipe;
  onUpdate: (healthTips: string) => void;
}

export default function HealthTipsForm({
  recipe,
  onUpdate,
}: HealthTipsFormProps) {
  const [healthTips, setHealthTips] = useState(recipe.healthTips || "");

  const handleSave = () => {
    onUpdate(healthTips);
  };

  const suggestedTips = [
    "This recipe is rich in protein, making it great for muscle building and repair.",
    "The high fiber content in this dish can help support digestive health.",
    "Consider using whole grain alternatives to increase nutritional value.",
    "This recipe provides a good source of antioxidants from the fresh vegetables.",
    "The healthy fats in this dish can support heart health when eaten as part of a balanced diet.",
    "This meal is naturally low in sodium, making it heart-friendly.",
    "The combination of ingredients provides a complete amino acid profile.",
    "This recipe can be easily modified for different dietary restrictions.",
  ];

  const addSuggestedTip = (tip: string) => {
    const currentTips = healthTips.trim();
    const newTips = currentTips ? `${currentTips}\n\n• ${tip}` : `• ${tip}`;
    setHealthTips(newTips);
  };

  const ingredientBasedTips = [
    {
      condition: "contains spinach or leafy greens",
      tip: "The leafy greens in this recipe provide iron and folate, essential for healthy blood cells.",
    },
    {
      condition: "contains salmon or fish",
      tip: "The omega-3 fatty acids in fish support brain health and reduce inflammation.",
    },
    {
      condition: "contains quinoa or whole grains",
      tip: "Whole grains provide sustained energy and important B vitamins.",
    },
    {
      condition: "contains beans or legumes",
      tip: "Legumes are an excellent source of plant-based protein and fiber.",
    },
    {
      condition: "contains berries or colorful fruits",
      tip: "The antioxidants in colorful fruits help protect cells from damage.",
    },
  ];

  const nutritionBasedTips = [
    {
      condition: "high protein",
      tip: "This high-protein recipe can help with satiety and muscle maintenance.",
    },
    {
      condition: "low sodium",
      tip: "This recipe is naturally low in sodium, supporting heart health.",
    },
    {
      condition: "high fiber",
      tip: "The fiber content helps promote digestive health and stable blood sugar.",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2" />
            Health Tips & Nutritional Guidance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Health Tips */}
          <div className="space-y-3">
            <Label htmlFor="healthTips">Health Tips</Label>
            <Textarea
              id="healthTips"
              placeholder="Add health tips, nutritional benefits, or dietary advice for this recipe..."
              value={healthTips}
              onChange={(e) => setHealthTips(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Provide helpful information about the nutritional benefits, health
              impacts, or dietary considerations for this recipe.
            </p>
          </div>

          <Separator />

          {/* Suggested Tips */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <Label className="text-base font-semibold">Suggested Tips</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Click on any suggestion to add it to your health tips:
            </p>
            <div className="space-y-3">
              {suggestedTips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer transition-colors"
                  onClick={() => addSuggestedTip(tip)}
                >
                  <Plus className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Ingredient-Based Suggestions */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              Ingredient-Based Suggestions
            </Label>
            <p className="text-sm text-muted-foreground">
              Based on the ingredients in this recipe:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ingredientBasedTips.map((item, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => addSuggestedTip(item.tip)}
                >
                  <div className="flex items-start gap-2">
                    <Plus className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <Badge variant="outline" className="text-xs mb-2">
                        {item.condition}
                      </Badge>
                      <p className="text-sm">{item.tip}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Nutritional Guidance Templates */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              Nutritional Guidance Templates
            </Label>
            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Portion Control Advice</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  This recipe serves {recipe.servings || "X"} people. For weight
                  management, consider pairing with a side salad to increase
                  volume without significantly adding calories.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    addSuggestedTip(
                      "This recipe serves " +
                        (recipe.servings || "X") +
                        " people. For weight management, consider pairing with a side salad to increase volume without significantly adding calories."
                    )
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">
                  Dietary Modification Suggestions
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  This recipe can be modified to meet various dietary needs.
                  Contact a registered dietitian for personalized advice based
                  on your specific health goals.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    addSuggestedTip(
                      "This recipe can be modified to meet various dietary needs. Contact a registered dietitian for personalized advice based on your specific health goals."
                    )
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">
                  Meal Timing Recommendations
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  This recipe works well as a{" "}
                  {recipe.tags?.some((t) =>
                    t.tag.tagName.toLowerCase().includes("breakfast")
                  )
                    ? "breakfast"
                    : "main meal"}
                  and provides balanced nutrition to keep you satisfied.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    addSuggestedTip(
                      "This recipe works well as a main meal and provides balanced nutrition to keep you satisfied."
                    )
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="flex items-center">
              <Save className="h-4 w-4 mr-2" />
              Save Health Tips
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
